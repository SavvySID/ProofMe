pragma circom 2.0.0;

template AgeCheck() {
    // Private inputs
    signal input birthYear;
    signal input currentYear;
    
    // Public output - only reveals if age >= 18, not the actual age
    signal output isOver18;
    
    // Calculate age
    signal age <== currentYear - birthYear;
    
    // Check if age >= 18 using a simple comparison
    // This is a simplified version that works without external libraries
    component isOver18Check = IsOver18();
    isOver18Check.birthYear <== birthYear;
    isOver18Check.currentYear <== currentYear;
    isOver18 <== isOver18Check.out;
}

template IsOver18() {
    signal input birthYear;
    signal input currentYear;
    signal output out;
    
    // Simple age calculation and comparison
    signal age <== currentYear - birthYear;
    
    // For now, we'll use a simple approach
    // In production, this would use proper comparison circuits
    out <== (age >= 18) ? 1 : 0;
}

component main = AgeCheck();

