document.addEventListener('DOMContentLoaded', () => {
  const expiryDateInput = document.getElementById('expiryDate');
  const creditCardInput = document.getElementById('cardNumber');
  const submitButton = document.getElementById('submitButton');
  const zipCodeInput= document.getElementById('billingZip');
  const cvv= document.getElementById('cvv');
  const firstName = document.getElementById('cardHolderFirstName');
  const lastName = document.getElementById('cardHolderLastName');
  const form = document.getElementById('creditCardForm');
  const responseMessage = document.getElementById('responseMessage');

  // Format card number
  const formatCardNumber = (value) => value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();

  // Validate credit card number
  const validateCreditCardNumber = (value) => {
    const numericValue = value.replace(/\s+/g, '');
    const isValidLength = numericValue.length >= 15 && numericValue.length <= 16;
    const hasMatchingDigits = numericValue.charAt(0) === numericValue.charAt(numericValue.length - 1);
    return isValidLength && hasMatchingDigits;
  };
  function isValidExpirationDate(expMonth, expYear) {
    // Check if the year is between 2024 and 2099
    const isValidYear = expYear >= 2024 && expYear <= 2099;
  
    // Check if the month is between 01 and 12
    const isValidMonth = expMonth >= 1 && expMonth <= 12;
  
    return isValidYear && isValidMonth;
  }
  // Event handler for formatting and validating credit card input
  const handleCreditCardInput = (event) => {
    const formattedNumber = formatCardNumber(event.target.value);
    event.target.value = formattedNumber;
    document.getElementById('cardNumberPreview').textContent = formattedNumber;
  };

  creditCardInput.addEventListener('input', (event) => {
    handleCreditCardInput(event);
    updateSubmitButtonState(); // Update submit button state
  });

  // Format expiry date
  expiryDateInput.addEventListener('input', (e) => {
    let input = e.target.value.replace(/\D/g, '');
    if (input.length === 2 && e.inputType !== 'deleteContentBackward') input += '/';
    else if (input.length === 2) input = input.substring(0, 1);
    else if (input.length > 2 && input[2] !== '/') input = `${input.substring(0, 2)}/${input.substring(2)}`;
    e.target.value = input;
    const parts = input.split('/');
    const expMonth = parts.length === 2 ? parseInt(parts[0], 10) : null;
    const expYear = parts.length === 2 ? parseInt('20' + parts[1], 10) : null;
    const isValid = expMonth && expYear && isValidExpirationDate(expMonth, expYear);
    submitButton.disabled = !isValid; // Toggle submit button based on validity
    if (!isValid) console.log('Credit card expiration date is invalid.');
    document.getElementById('cardExpiryPreview').textContent = input;
    updateSubmitButtonState();
  });

  // Update CVV
  cvv.addEventListener('input', function() {
    document.getElementById('cardCvvBackPreview').textContent = this.value;
  });

  // Update cardholder's name
  const updateCardholderName = () => {
    const firstName = document.getElementById('cardHolderFirstName').value;
    const lastName = document.getElementById('cardHolderLastName').value;
    document.getElementById('cardNamePreview').textContent = `${firstName} ${lastName}`.trim().toUpperCase() || 'YOUR NAME';
  };
  // Validate zip
  zipCodeInput.addEventListener('input', (e) => {
    let input = e.target.value.replace(/\D/g, ''); // Remove all non-digit characters
    if (input.length > 5 && input[5] !== '-') {
        // Only add dash if more than 5 digits and no dash present
        input = `${input.substring(0, 5)}-${input.substring(5)}`;
    }
    e.target.value = input;   
    updateSubmitButtonState(); // Assuming this is a custom function to update the button state
});
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

function autoCapitalizeInput(event) {
  const value = event.target.value;
  if (value.length > 1 || (value.length === 1 && value !== value.toUpperCase())) {
    let parts = value.split(' ').map(part => {
      // Only capitalize if the word is more than 1 character or if it's a single lowercase letter
      if (part.length > 1 || (part.length === 1 && part !== part.toUpperCase())) {
        return capitalizeFirstLetter(part);
      } else {
        return part;
      }
    });
    event.target.value = parts.join(' ');
  }
}

firstName.addEventListener('input', updateCardholderName);
lastName.addEventListener('input', updateCardholderName);

firstName.addEventListener('input', autoCapitalizeInput);
lastName.addEventListener('input', autoCapitalizeInput);
  

  const updateSubmitButtonState = () => {
    const isValidCardNumber = validateCreditCardNumber(creditCardInput.value);
    document.getElementById('cardError').textContent = isValidCardNumber ? '' : 'Invalid card number.';
  
    const isValidExpiryDate = expiryDateInput.value.split('/').length === 2 && 
                              isValidExpirationDate(parseInt(expiryDateInput.value.split('/')[0], 10), 
                              parseInt('20' + expiryDateInput.value.split('/')[1], 10));
    document.getElementById('expiryError').textContent = isValidExpiryDate ? '' : 'Invalid expiry date.';
  
    const isValidZip = /^\d{5}-\d{4}$/.test(zipCodeInput.value) || /^\d{5}$/.test(zipCodeInput.value);
    document.getElementById('zipError').textContent = isValidZip ? '' : 'Invalid ZIP code.';
  
    const firstNameInput = document.getElementById('cardHolderFirstName');
    const lastNameInput = document.getElementById('cardHolderLastName');
    const isNameEntered = firstNameInput.value.trim() !== '' && lastNameInput.value.trim() !== '';
    document.getElementById('nameError').textContent = isNameEntered ? '' : 'First and Last name are required.';
  
    submitButton.disabled = !(isValidCardNumber && isValidExpiryDate && isValidZip && isNameEntered);
  };
  

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Assuming you have a function to get the form data
    const formData = new FormData(form);

    // Convert formData to a plain object
    const payload = {};
    formData.forEach(function(value, key){
        payload[key] = value;
    });
    console.log("Payload:", payload); // Add this line to see the payload in the console

    // API call with fetch
    fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: {
        'Content-type': 'application/json; charset=UTF-8'
      }
    })
    .then(response => response.json())
    .then(json => {
      // Success message with ID from response
      responseMessage.innerHTML = `Success! Your transaction ID is ${json.id}`;
      responseMessage.style.color = 'green';
    })
    .catch(error => {
      // Error message
      responseMessage.innerHTML = 'Failed to process the transaction. Please try again later.';
      responseMessage.style.color = 'red';
    });
  });
  
  
});
