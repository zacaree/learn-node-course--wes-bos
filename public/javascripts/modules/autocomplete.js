function autocomplete(input, latInput, lngInput) {
  // console.log(input, latInput, lngInput);
  if (!input) return; // Skip this fn from running if there's no input on page
  const dropdown = new google.maps.places.Autocomplete(input);
}

export default autocomplete;