# Search Demo

## Overview

A new API was created, includes a search endpoint with two options to search for (model and individual guitars) documented here https://github.com/mrozanski/guitar_registry/blob/main/api-docs.md 
It's running locally and can be accessed using http://localhost:8000/api
Your next task is to create a UI component that implements that search. 
For this task, the search will be triggered from a demo page under /search-demo
It should include a form with input fields for all the parameters supported by the endpoint. (for numbers use number only fields, for text, text, etc)
If a parameter is required, it should have an asterisk next to the label
If a parameter is conditional upon another, implement the UI logic to show or hide the dependant fields, and/or mark them as required
Excluding fields should also be managed with the necessary conditions so the fields visible in the form are always consistent with the values entered and the endpoint's supported options.
A Search button validates that the minimum required fields have values, if not, it uses the same error states the Create Expert Review form currently does.
If all required fields are present, clicking on Search makes a GET request to the api running in localhost:8000 and displays the results.
If the result is an error state, it is displayes as text.
If the result contains data, it is rendered as a list that displays.
For models it should include:
model name, year, manufacturer name, and a link to the model detail page.
For individual guitars:
serial number, model name, year, manufacturer name, and a link to the guitar detail page.