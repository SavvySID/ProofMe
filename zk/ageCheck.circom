pragma circom 2.0.0;

include "node_modules/circomlib/circuits/comparators.circom";

template AgeCheck() {
    // Private inputs
    signal input birthYear;
    signal input currentYear;
    
    // Public output - only reveals if age >= 18, not the actual age
    signal output isOver18;
    
    // Component for comparison
    component ageCheck = GreaterEqualThan(32);
    
    // Calculate age
    ageCheck.in[0] <== currentYear - birthYear;
    ageCheck.in[1] <== 18;
    
    // Output is 1 if age >= 18, 0 otherwise
    isOver18 <== ageCheck.out;
}

component main = AgeCheck(); 