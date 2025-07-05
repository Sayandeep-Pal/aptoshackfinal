module validator::validator {
    use aptos_framework::aptos_coin;
    use aptos_framework::coin;
    use aptos_framework::coin::Coin;

    /// Fixed fee in Octas (0.01 APT)
    const FEE_AMOUNT: u64 = 1_000_000;

    /// Replace with actual receiver address
    const RECEIVER: address = @0x5c3b2aa3cfa6103f67163f4025da028c866201380d56f7d37e6320a0e9c9756a;

    public entry fun pay_fee(account: &signer) {
        let payment: Coin<aptos_coin::AptosCoin> = coin::withdraw(account, FEE_AMOUNT);
        coin::deposit(RECEIVER, payment);
    }

    #[test(admin = @0x1234)]
    public entry fun test_pay_fee(admin: signer) {
        pay_fee(&admin);
    }
}
