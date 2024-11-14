const { expect } = require('chai');
const { ethers } = require('hardhat');

// Este código es un conjunto de pruebas para un contrato inteligente llamado Escrow
// (depósito en garantía) y otro contrato llamado RealEstate, escrito en JavaScript utilizando Hardhat
// (un entorno de desarrollo de Ethereum) y Chai (una biblioteca de aserciones para pruebas).

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

// Aquí, expect se importa de Chai para usarlo en las aserciones (comprobaciones de las pruebas). 
// ethers es una librería proporcionada por Hardhat para interactuar con contratos inteligentes. 
// La función tokens convierte un número n a su equivalente en unidades ether, 
// lo que facilita trabajar con cantidades de tokens en Ethereum.

describe('Escrow', async () => {
    // Aquí se define una serie de variables (direcciones) para representar a las partes involucradas 
    // (buyer, seller, inspector, lender). 
    // realEstate y escrow son instancias de los contratos RealEstate y Escrow respectivamente. 

    let buyer, seller, inspector, lender
    let realEstate, escrow

    // Esta función obtiene una lista de objetos Signer disponibles en el entorno de Hardhat. 
    // Un Signer representa una cuenta que puede enviar transacciones y firmar mensajes en la red de Ethereum.
    // const signers = await ethers.getSigners()
    // console.log(signers.length)
    // const buyer = signers[0]
    // const seller = signers[1]

    // La función beforeEach configura el entorno para cada prueba:
    beforeEach(async () => {

        // Configuración de cuentas
        // Cuentas: Obtiene cuatro cuentas de prueba (buyer, seller, inspector, lender).
        [buyer, seller, inspector, lender] = await ethers.getSigners()

        // Despliega RealEstate
        const RealEstate = await ethers.getContractFactory('RealEstate')
        realEstate = await RealEstate.deploy()

        // Crea un nuevo NFT (Mintea o acuña)
        // Minting de NFT: Utiliza mint para crear un token NFT, simulando una propiedad en una dirección IPFS.
        let transaction = await realEstate.connect(seller).mint("https://ipfs.io/ipfs/QmQVcpsjrA6cr1iJjZAodYwmPekYgbnXGo4DFubJiLc2EB/1.json")
        // console.log(realEstate.address)
        await transaction.wait()

        // Despliega Escrow
        const Escrow = await ethers.getContractFactory('Escrow')
        escrow = await Escrow.deploy(
            realEstate.address,
            seller.address,
            inspector.address,
            lender.address
        )
        // Aprobación y Listado de Propiedad: El seller aprueba el uso del token (NFT) para el contrato escrow y lo lista.
        // Aprueba la propiedad
        transaction = await realEstate.connect(seller).approve(escrow.address, 1)
        await transaction.wait()

        // Lista la propedad en Escrow
        // Al conectar escrow con seller, indicamos que cualquier acción en el contrato Escrow 
        // se realizará desde la cuenta de seller. 
        // Esto es crucial, ya que en el proceso de listado, generalmente solo el propietario o vendedor 
        // tiene autorización para listar la propiedad.
        transaction = await escrow.connect(seller).list(1, buyer.address, tokens(10), tokens(5))
        // 1: Este parece ser el ID de la propiedad o token que representa la propiedad en el contrato. 
        // El ID 1 identifica qué propiedad específica se está listando.
        // buyer.address: La dirección del comprador potencial. 
        // Esto indica quién es el comprador previsto o autorizado para esta transacción en el contrato de Escrow. 
        // tokens(10): El precio total de la propiedad, convertido a unidades de tokens 
        // (equivalente a 10 tokens de una criptomoneda o una representación específica de valor en el contrato). 
        // La función tokens convierte el número a la unidad que utiliza el contrato, 
        // posiblemente en wei si se trata de tokens en Ethereum.
        // tokens(5): Una posible cantidad de depósito o anticipo que el comprador 
        // debe realizar para reservar la propiedad, también convertido a unidades de tokens.
        await transaction.wait()
    })


    describe('Deployment', async () => {
        it('Returns NFT address', async () => {
            const result = await escrow.nftAddress()
            expect(result).to.be.equal(realEstate.address)
        })

        it('Returns seller', async () => {
            const result = await escrow.seller()
            expect(result).to.be.equal(seller.address)
        })

        it('Returns inspector', async () => {
            const result = await escrow.inspector()
            expect(result).to.be.equal(inspector.address)
        })
        it('Returns lender', async () => {
            const result = await escrow.lender()
            expect(result).to.be.equal(lender.address)
        })

    })

    describe('Listing', async () => {
        it('Updates as listed', async () => {
            const result = await escrow.isListed(1)
            expect(result).to.be.equal(true)
        })

        it('Updates ownership', async () => {
            expect(await realEstate.ownerOf(1)).to.be.equal(escrow.address)
        })

        it('Returns the buyer', async () => {
            const result = await escrow.buyer(1)
            expect(result).to.be.equal(buyer.address)
        })

        it('Returns purchasePrice', async () => {
            const result = await escrow.purchasePrice(1)
            expect(result).to.be.equal(tokens(10))
        })

        it('Returns escrow amount', async () => {
            const result = await escrow.escrowAmount(1)
            expect(result).to.be.equal(tokens(5))
        })
    })

    describe('Deposits', async () => {
        it('Updates contract balances', async () => {
            const transaction = await escrow.connect(buyer).depositEarnest(1, { value: tokens(5) })
            await transaction.wait()
            const result = await escrow.getBalance()
            expect(result).to.be.equal(tokens(5))
        })


    })

    describe('Inspection', async () => {
        it('Updates inspection status', async () => {
            const transaction = await escrow.connect(inspector).updateInspectionStatus(1, true)
            await transaction.wait()
            const result = await escrow.inspectionPassed(1)
            expect(result).to.be.equal(true)
        })


    })

    describe('Approval', async () => {
        it('Updates approval status', async () => {
            let transaction = await escrow.connect(buyer).approveSale(1)
            await transaction.wait()

            transaction = await escrow.connect(seller).approveSale(1)
            await transaction.wait()

            transaction = await escrow.connect(lender).approveSale(1)
            await transaction.wait()

            expect(await escrow.approval(1, buyer.address)).to.be.equal(true)
            expect(await escrow.approval(1, seller.address)).to.be.equal(true)
            expect(await escrow.approval(1, lender.address)).to.be.equal(true)

        })


    })

    describe('Sale', async () => {
        beforeEach(async () => {
            let transaction = await escrow.connect(buyer).depositEarnest(1, { value: tokens(5) })
            await transaction.wait()

            transaction = await escrow.connect(inspector).updateInspectionStatus(1, true)
            await transaction.wait()

            transaction = await escrow.connect(buyer).approveSale(1)
            await transaction.wait()

            transaction = await escrow.connect(seller).approveSale(1)
            await transaction.wait()

            transaction = await escrow.connect(lender).approveSale(1)
            await transaction.wait()

            await lender.sendTransaction({ to: escrow.address, value: tokens(5) })

            transaction = await escrow.connect(seller).finalizeSale(1)
            await transaction.wait()
        })

        it('Update ownership', async () => {
            expect(await realEstate.ownerOf(1)).to.be.equal(buyer.address)
        })

        it('Update balances', async () => {
            expect(await escrow.getBalance()).to.be.equal(0)
        })

    })

})