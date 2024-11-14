//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IERC721 {
    function transferFrom(address _from, address _to, uint256 _id) external;
}

contract Escrow {
    address public nftAddress;
    address payable public seller;
    address public inspector;
    address public lender;

    modifier onlyBuyer(uint256 _nftID) {
        require(msg.sender == buyer[_nftID], "Only buyer can call this method");
        _;
    }

    modifier onlySeller() {
        require(msg.sender == seller, "Only seller can call this method");
        _;
    }

    modifier onlyInspector() {
        require(msg.sender == inspector, "Only inspector can call this method");
        _;
    }

    mapping(uint256 => bool) public isListed;
    mapping(uint256 => uint256) public purchasePrice;
    mapping(uint256 => uint256) public escrowAmount;
    mapping(uint256 => address) public buyer;
    mapping(uint256 => bool) public inspectionPassed;
    mapping(uint256 => mapping(address => bool)) public approval;

    constructor(
        address _nftAddress,
        address payable _seller,
        address _inspector,
        address _lender
    ) {
        nftAddress = _nftAddress;
        seller = _seller;
        inspector = _inspector;
        lender = _lender;
    }

    function list(
        uint256 _nftID,
        address _buyer,
        uint256 _purchasePrice,
        uint256 _escrowAmount
    ) public payable onlySeller {
        // Transfer NFT from seller to this contract
        IERC721(nftAddress).transferFrom(msg.sender, address(this), _nftID);

        isListed[_nftID] = true;
        purchasePrice[_nftID] = _purchasePrice;
        escrowAmount[_nftID] = _escrowAmount;
        buyer[_nftID] = _buyer;
    }

    // Put under Contract (only buyer - payable escrow amount)
    function depositEarnest(uint256 _nftID) public payable onlyBuyer(_nftID) {
        require(msg.value >= escrowAmount[_nftID]);
    }

    // Aprove Sale
    function approveSale(uint256 _nftID) public {
        approval[_nftID][msg.sender] = true;
    }

    

    // Update inspection Status (only inspector)
    function updateInspectionStatus(
        uint256 _nftID,
        bool _passed
    ) public onlyInspector {
        inspectionPassed[_nftID] = _passed;
    }

   

    // Finalize Sale
    // -> Require inspection status (add more items here, like appraisal)
    // -> Require sale to be authorised
    // -> Transfer NFT to buyer
    // -> Transfer funds to Seller

    function finalizeSale(uint256 _nftID) public {
        require(inspectionPassed[_nftID]);
        require(approval[_nftID][buyer[_nftID]]);
        require(approval[_nftID][seller]);
        require(approval[_nftID][lender]);
        require(address(this).balance >= purchasePrice[_nftID]);

        isListed[_nftID] = false;

        (bool success, ) = payable(seller).call{value: address(this).balance}(
            ""
        );
        require(success, "Transfer to seller failed");

        // Transfer NFT from seller to buyer

        IERC721(nftAddress).transferFrom(address(this), buyer[_nftID], _nftID);

        // Realiza una transferencia de un token NFT específico desde el contrato Escrow
        // al comprador una vez que se cumplen ciertas condiciones.
        // Vamos a desglosar cada parte para entender su propósito.

        // IERC721(nftAddress):Aquí, IERC721 es una interfaz que representa un contrato ERC-721
        // (el estándar para tokens no fungibles, o NFTs).

        // nftAddress es la dirección del contrato NFT que contiene el token que estamos transfiriendo.
        // Esto básicamente indica que estamos interactuando con el contrato NFT ubicado en nftAddress.
        // transferFrom(address(this), buyer[_nftID], _nftID):

        // La función transferFrom es una función estándar en los contratos ERC-721
        // que transfiere la propiedad de un NFT de una dirección a otra.
        // address(this): Este es el primer argumento de transferFrom
        // y representa la dirección del contrato Escrow.
        // Indica que el contrato Escrow es el actual propietario del NFT
        // y quien realiza la transferencia.

        // buyer[_nftID]: Este es el segundo argumento,
        // que representa la dirección del comprador de este NFT específico,
        // identificado por _nftID. El buyer fue previamente especificado
        // en el mapeo buyer como el comprador designado.

        // _nftID: Es el tercer argumento
        // y representa el ID del token NFT que se está transfiriendo.

        // Función General
        // Esta línea de código realiza una transferencia de un token NFT desde el contrato Escrow al buyer de la propiedad identificada por _nftID. Esta acción probablemente se ejecuta
        // como parte de un proceso de cierre de venta (finalizeSale) una vez que se cumplen las condiciones de la transacción.
    }


    // Cancel Sale (handle earnest deposit)
    // -> if inspection status is not approved, then refund, otherwise send to seller
    function cancelSale(uint256 _nftID) public {
        if(inspectionPassed[_nftID] == false) {
            payable(buyer[_nftID]).transfer(address(this).balance);
                    } else {
                        payable(seller).transfer(address(this).balance);
                    }
    }
    
    // La función receive se ejecuta automáticamente cuando se envía Ether al contrato
    // sin ningún dato o llamada de función explícita.
    // Esto suele ocurrir cuando alguien transfiere
    // Ether al contrato usando la dirección del contrato directamente,
    // sin especificar ninguna función.
    receive() external payable {}

     function getBalance() public view returns (uint256) {
        return address(this).balance;
    }
}
