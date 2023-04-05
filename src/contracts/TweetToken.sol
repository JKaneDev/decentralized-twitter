// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract TweetToken {

    // Variables
    string public name = "Tweet Token";
    string public symbol = 'TWEET';
    uint256 public decimals = 18;
    uint256 public totalSupply;

    // Track Balances
    mapping(address => uint256) public balanceOf;
    // deployer => exchange => allowance amount
    mapping(address => mapping(address => uint256)) public allowance;
    
    // Events
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);


    constructor() {
        totalSupply = 1000000 * (10 ** 18);
        balanceOf[msg.sender] = totalSupply;
    }

    function getName() public view returns (string memory) {
        return name;
    }

    function getSymbol() public view returns (string memory) {
        return symbol;
    }

    function getDecimals() public view returns (uint256) {
        return decimals;
    }

    function getTotalSupply() public view returns (uint256) {
        return totalSupply;
    }

    function getBalanceOf(address _owner) public view returns (uint256 balance) {
        return balanceOf[_owner];
    }

    function getAllowance(address owner, address spender) public view returns (uint256) {
        return allowance[owner][spender];
    }


    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value);
        _transfer(msg.sender, _to, _value);
        return true;
    }

    function _transfer(address _from, address _to, uint256 _value) internal {
        require(_to != address(0));
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(_from, _to, _value);
    }

    function approve(address _spender, uint256 _value) public returns (bool success) {
        require(_spender != address(0));
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }   

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        require(_value <= balanceOf[_from]);
        require(_value <= allowance[_from][msg.sender]);
        allowance[_from][msg.sender] = allowance[_from][msg.sender] - _value;
        _transfer(_from, _to, _value);
        return true;
    }
}