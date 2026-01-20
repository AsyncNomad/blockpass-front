// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract BlockpassPass {
    address public owner;
    uint256 public priceWei;
    uint256 public durationSeconds;
    bool public bankrupt;

    uint256[] public refundThresholds;
    uint256[] public refundPercents;

    struct Subscription {
        uint256 startAt;
        uint256 endAt;
        uint256 pricePaid;
        bool active;
        bool refunded;
    }

    mapping(address => Subscription) public subscriptions;

    constructor(
        uint256 _priceWei,
        uint256 _durationSeconds,
        uint256[] memory _thresholds,
        uint256[] memory _percents
    ) {
        require(_priceWei > 0, "price required");
        require(_durationSeconds > 0, "duration required");
        require(_thresholds.length == _percents.length, "rule length mismatch");
        require(_thresholds.length > 0, "rules required");

        owner = msg.sender;
        priceWei = _priceWei;
        durationSeconds = _durationSeconds;
        refundThresholds = _thresholds;
        refundPercents = _percents;
    }

    function purchase() external payable {
        require(!bankrupt, "bankrupt");
        require(msg.value == priceWei, "invalid price");

        Subscription storage sub = subscriptions[msg.sender];
        if (sub.active) {
            require(block.timestamp >= sub.endAt, "already active");
        }

        sub.startAt = block.timestamp;
        sub.endAt = block.timestamp + durationSeconds;
        sub.pricePaid = msg.value;
        sub.active = true;
        sub.refunded = false;
    }

    function declareBankruptcy() external {
        Subscription storage sub = subscriptions[msg.sender];
        require(sub.active, "no active pass");
        bankrupt = true;
    }

    function declareBankruptcyAndRefund() external {
        Subscription storage sub = subscriptions[msg.sender];
        require(sub.active, "no active pass");
        bankrupt = true;
        _refund(msg.sender);
    }

    function refund() external {
        Subscription storage sub = subscriptions[msg.sender];
        require(sub.active, "no active pass");
        _refund(msg.sender);
    }

    function calculateRefundAmount(address user) public view returns (uint256) {
        Subscription memory sub = subscriptions[user];
        if (!sub.active) {
            return 0;
        }

        uint256 elapsed = block.timestamp - sub.startAt;
        for (uint256 i = 0; i < refundThresholds.length; i++) {
            if (elapsed < refundThresholds[i]) {
                return (sub.pricePaid * refundPercents[i]) / 100;
            }
        }

        return 0;
    }

    function getSubscription(address user)
        external
        view
        returns (uint256 startAt, uint256 endAt, bool active, bool refunded)
    {
        Subscription memory sub = subscriptions[user];
        return (sub.startAt, sub.endAt, sub.active, sub.refunded);
    }

    function _refund(address user) internal {
        Subscription storage sub = subscriptions[user];
        uint256 refundAmount = calculateRefundAmount(user);

        sub.active = false;
        sub.refunded = true;

        if (refundAmount > 0) {
            (bool success, ) = user.call{value: refundAmount}("");
            require(success, "transfer failed");
        }
    }
}
