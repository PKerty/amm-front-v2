use dep::std;

fn main(key: Field, nonce: pub Field, sender: pub Field, amount1: pub Field, amount2: pub Field, token1: pub Field, token2: pub Field) 
-> pub Field{
    let hash = std::hash::pedersen_hash([key, nonce, sender, amount1, amount2, token1, token2]);
    hash
}