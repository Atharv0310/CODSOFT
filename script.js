document.addEventListener('DOMContentLoaded', () => {
    const display = document.querySelector('.calculator-display');
    const buttons = document.querySelector('.calculator-buttons');

    let firstOperand = '';
    let secondOperand = '';
    let currentOperator = null;
    let shouldResetDisplay = false;
    let operationDisplayed = false; // New flag to track if operator is on display

    // Function to update the display
    function updateDisplay(value) {
        display.value = value;
    }

    // Function to clear the calculator
    function clearCalculator() {
        firstOperand = '';
        secondOperand = '';
        currentOperator = null;
        shouldResetDisplay = false;
        operationDisplayed = false; // Reset the flag
        updateDisplay('0');
    }

    // Function to delete the last character
    function deleteLastCharacter() {
        if (display.value.length > 1 && display.value !== '0') {
            const lastChar = display.value.slice(-1);
            // Check if the last character is an operator we added
            if (['+', '-', 'x', '÷', '%'].includes(lastChar) && operationDisplayed) {
                display.value = display.value.slice(0, -1); // Remove the operator
                currentOperator = null; // Clear the operator state
                operationDisplayed = false; // Reset the flag
                // If there's still a number, make it the first operand
                if (display.value.length > 0) {
                    firstOperand = display.value;
                }
            } else {
                display.value = display.value.slice(0, -1);
                if (currentOperator === null) {
                    firstOperand = display.value;
                } else {
                    secondOperand = display.value;
                }
            }
        } else {
            clearCalculator();
        }
    }


    // Function to handle number input
    function appendNumber(number) {
        if (shouldResetDisplay && !operationDisplayed) { // Only reset if not in middle of displaying an operation
            display.value = number;
            shouldResetDisplay = false;
        } else if (display.value === '0' || display.value === '-0' || (operationDisplayed && (display.value === firstOperand + currentOperator))) {
            // If it's just '0' or an operator was just added, replace it with the new number
            display.value = number;
            operationDisplayed = false; // A new number input clears the operator display state
        } else {
            display.value += number;
        }

        if (currentOperator === null) {
            firstOperand = display.value;
        } else {
            secondOperand = display.value;
        }
    }

    // Function to handle decimal point
    function appendDecimal() {
        if (shouldResetDisplay) {
            display.value = '0.';
            shouldResetDisplay = false;
            operationDisplayed = false; // Clear operator display state if starting new number with decimal
        } else if (!display.value.includes('.')) {
            display.value += '.';
        }

        if (currentOperator === null) {
            firstOperand = display.value;
        } else {
            secondOperand = display.value;
        }
    }

    // Function to handle operator clicks
    function handleOperator(operator) {
        if (firstOperand === '' && display.value === '0') { // Prevent starting with an operator if display is '0'
            return;
        }

        if (currentOperator !== null && secondOperand !== '') {
            calculate(); // Perform previous calculation if applicable
            // After calculation, firstOperand is updated. Now proceed with new operator.
            currentOperator = operator;
            shouldResetDisplay = true; // Still want to reset display for next number
            updateDisplay(firstOperand + currentOperator); // Display first operand + new operator
            operationDisplayed = true;
            secondOperand = ''; // Clear second operand after calculation
        } else if (currentOperator !== null && currentOperator !== operator) {
            // If an operator is already selected but a new one is clicked, just change it on display
            const currentDisplay = display.value;
            // Find the index of the previously displayed operator
            const prevOperatorIndex = currentDisplay.lastIndexOf(currentOperator);
            if (prevOperatorIndex !== -1) {
                display.value = currentDisplay.substring(0, prevOperatorIndex) + operator;
            } else {
                display.value = currentDisplay + operator;
            }
            currentOperator = operator;
            operationDisplayed = true;
        }
        else {
            currentOperator = operator;
            // Only append operator if it's not already displayed
            if (!operationDisplayed || display.value !== firstOperand + currentOperator) {
                 updateDisplay(firstOperand + currentOperator);
                 operationDisplayed = true;
            }
            shouldResetDisplay = true; // Prepare for next number input
        }
    }


    // Function to perform calculations
    function calculate() {
        let result;
        const prev = parseFloat(firstOperand);
        // If secondOperand is empty, it means user clicked '=' immediately after operator
        // or chain operation with single number. In this case, use prev as current for some ops
        const current = parseFloat(secondOperand === '' ? display.value.replace(firstOperand + currentOperator, '') : secondOperand);


        if (isNaN(prev) || (isNaN(current) && currentOperator !== '%')) { // % can work on single number
            // If second operand is missing for regular ops, just display first operand
            if (currentOperator === null) {
                updateDisplay(firstOperand);
            }
            return;
        }

        switch (currentOperator) {
            case '+':
                result = prev + current;
                break;
            case '-':
                result = prev - current;
                break;
            case 'x':
                result = prev * current;
                break;
            case '÷':
                if (current === 0) {
                    alert("Cannot divide by zero!");
                    clearCalculator();
                    return;
                }
                result = prev / current;
                break;
            case '%':
                 // This is a common interpretation for percentage in calculators:
                 // If there's an operator and a second operand, it applies the percentage to the previous number:
                 // e.g., 50 + 10% = 50 + (50 * 0.10) = 55
                 // If no second operand (i.e., percentage clicked after a number), it simply converts the number to its percentage value:
                 // e.g., 50% = 0.5
                 if (secondOperand !== '') { // If there's a second number after an operator, apply percentage
                    // This specific implementation assumes percentage is a *modifier* to an existing operation.
                    // For example, 100 + 50% should be 150.
                    // If you want 100 + 50 then % gives 1.5, that's different.
                    // Let's stick to the common: 50 + 10% means 50 + (50 * 0.1)
                    if (currentOperator === '+') result = prev + (prev * (current / 100));
                    else if (currentOperator === '-') result = prev - (prev * (current / 100));
                    else if (currentOperator === 'x') result = prev * (current / 100);
                    else if (currentOperator === '÷') result = prev / (current / 100);
                    else result = current / 100; // Fallback for direct percentage on one number
                 } else {
                    result = prev / 100; // If no second operand, it's just a percentage of the first
                 }
                 break;
            default:
                return;
        }

        updateDisplay(result.toString());
        firstOperand = result.toString();
        secondOperand = '';
        currentOperator = null; // Clear operator after calculation
        shouldResetDisplay = true; // Prepare for new input
        operationDisplayed = false; // Reset the flag
    }

    // Event Listener for button clicks (delegation)
    buttons.addEventListener('click', (event) => {
        const target = event.target;
        if (!target.matches('button')) return; // Ignore clicks not on buttons

        const buttonText = target.textContent;
        const action = target.dataset.action;

        if (target.classList.contains('operator')) {
            if (action === 'clear') {
                clearCalculator();
            } else if (action === 'backspace') {
                deleteLastCharacter();
            } else if (action === 'percentage') {
                 // Handle percentage calculation directly, if it's the only operation or after a number
                 if (currentOperator === null) {
                     let num = parseFloat(display.value);
                     if (!isNaN(num)) {
                         updateDisplay((num / 100).toString());
                         firstOperand = display.value;
                         shouldResetDisplay = true;
                         operationDisplayed = false; // No operator displayed after direct percentage
                     }
                 } else {
                     // If an operator is already present, calculate with percentage modifier
                     calculate(); // This will handle the percentage as part of the overall calculation
                 }
            }
            else if (action === 'calculate') {
                calculate();
            } else {
                handleOperator(buttonText);
            }
        } else if (buttonText === '.') {
            appendDecimal();
        } else {
            appendNumber(buttonText);
        }
    });

    // Initialize display
    updateDisplay('0');
});