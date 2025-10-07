export const W2ExtractGrok = {
    "id": "w2-2024-0001",
    "clientId": "client-123",
    "docType": "W2",
    "fileName": "W2_sample.pdf",
    "status": "EXTRACTED",
    "uploadedDate": "2025-08-24",
    "required": true,
    "extractedData": {
    "meta": {
    "taxYear": {
    "id": "meta.taxYear",
    "label": "Tax Year",
    "value": 2024,
    "confidence": 1,
    "validated": false,
    "anchor": null
    },
    "copy": {
    "id": "meta.copy",
    "label": "Copy",
    "value": "B",
    "confidence": 1,
    "validated": false,
    "anchor": null
    },
    "reissued": {
    "id": "meta.reissued",
    "label": "Reissued",
    "value": false,
    "confidence": 1,
    "validated": false,
    "anchor": null
    },
    "controlNumber": {
    "id": "meta.controlNumber",
    "label": "Control Number",
    "value": "CN-987654",
    "confidence": 1,
    "validated": false,
    "anchor": null
    }
    },
    "employee": {
    "employeeSsn": {
    "id": "employee.employeeSsn",
    "label": "Employee SSN",
    "value": "123-45-6789",
    "confidence": 1,
    "validated": false,
    "anchor": null
    },
    "name": {
    "first": {
    "id": "employee.name.first",
    "label": "First Name",
    "value": "John",
    "confidence": 1,
    "validated": false,
    "anchor": null
    },
    "middle": {
    "id": "employee.name.middle",
    "label": "Middle Name",
    "value": null,
    "confidence": 1,
    "validated": false,
    "anchor": null
    },
    "last": {
    "id": "employee.name.last",
    "label": "Last Name",
    "value": "Doe",
    "confidence": 1,
    "validated": false,
    "anchor": null
    },
    "suffix": {
    "id": "employee.name.suffix",
    "label": "Suffix",
    "value": null,
    "confidence": 1,
    "validated": false,
    "anchor": null
    }
    },
    "address": {
    "street": {
    "id": "employee.address.street",
    "label": "Street",
    "value": "100 Main St",
    "confidence": 1,
    "validated": false,
    "anchor": null
    },
    "city": {
    "id": "employee.address.city",
    "label": "City",
    "value": "Springfield",
    "confidence": 1,
    "validated": false,
    "anchor": null
    },
    "state": {
    "id": "employee.address.state",
    "label": "State",
    "value": "IL",
    "confidence": 1,
    "validated": false,
    "anchor": null
    },
    "zip": {
    "id": "employee.address.zip",
    "label": "Zip",
    "value": "62701",
    "confidence": 1,
    "validated": false,
    "anchor": null
    }
    }
    },
    "employer": {
    "employerEin": {
    "id": "employer.employerEin",
    "label": "Employer EIN",
    "value": "12-3456789",
    "confidence": 1,
    "validated": false,
    "anchor": null
    },
    "name": {
    "id": "employer.name",
    "label": "Employer Name",
    "value": "Example Corp LLC",
    "confidence": 1,
    "validated": false,
    "anchor": null
    },
    "address": {
    "street": {
    "id": "employer.address.street",
    "label": "Street",
    "value": "500 Market Ave",
    "confidence": 1,
    "validated": false,
    "anchor": null
    },
    "city": {
    "id": "employer.address.city",
    "label": "City",
    "value": "Springfield",
    "confidence": 1,
    "validated": false,
    "anchor": null
    },
    "state": {
    "id": "employer.address.state",
    "label": "State",
    "value": "IL",
    "confidence": 1,
    "validated": false,
    "anchor": null
    },
    "zip": {
    "id": "employer.address.zip",
    "label": "Zip",
    "value": "62702",
    "confidence": 1,
    "validated": false,
    "anchor": null
    }
    }
    },
    "federal": {
    "wagesTipsOtherComp": {
    "id": "federal.wagesTipsOtherComp",
    "label": "Wages, tips, other compensation",
    "value": 86500.25,
    "confidence": 1,
    "validated": false,
    "anchor": null
    },
    "federalIncomeTaxWithheld": {
    "id": "federal.federalIncomeTaxWithheld",
    "label": "Federal income tax withheld",
    "value": 11500.72,
    "confidence": 1,
    "validated": false,
    "anchor": null
    },
    "socialSecurityWages": {
    "id": "federal.socialSecurityWages",
    "label": "Social security wages",
    "value": 86500.25,
    "confidence": 1,
    "validated": false,
    "anchor": null
    },
    "socialSecurityTaxWithheld": {
    "id": "federal.socialSecurityTaxWithheld",
    "label": "Social security tax withheld",
    "value": 5351.02,
    "confidence": 1,
    "validated": false,
    "anchor": null
    },
    "medicareWagesAndTips": {
    "id": "federal.medicareWagesAndTips",
    "label": "Medicare wages and tips",
    "value": 86500.25,
    "confidence": 1,
    "validated": false,
    "anchor": null
    },
    "medicareTaxWithheld": {
    "id": "federal.medicareTaxWithheld",
    "label": "Medicare tax withheld",
    "value": 1254.28,
    "confidence": 1,
    "validated": false,
    "anchor": null
    },
    "socialSecurityTips": {
    "id": "federal.socialSecurityTips",
    "label": "Social security tips",
    "value": 0,
    "confidence": 1,
    "validated": false,
    "anchor": null
    },
    "allocatedTips": {
    "id": "federal.allocatedTips",
    "label": "Allocated tips",
    "value": 0,
    "confidence": 1,
    "validated": false,
    "anchor": null
    },
    "dependentCareBenefits": {
    "id": "federal.dependentCareBenefits",
    "label": "Dependent care benefits",
    "value": 0,
    "confidence": 1,
    "validated": false,
    "anchor": null
    },
    "nonqualifiedPlans": {
    "id": "federal.nonqualifiedPlans",
    "label": "Nonqualified plans",
    "value": 0,
    "confidence": 1,
    "validated": false,
    "anchor": null
    }
    },
    "box12": [
    {
    "code": {
    "id": "box12.0.code",
    "label": "Code",
    "value": "D",
    "confidence": 1,
    "validated": false,
    "anchor": null
    },
    "amount": {
    "id": "box12.0.amount",
    "label": "Amount",
    "value": 5500.00,
    "confidence": 1,
    "validated": false,
    "anchor": null
    }
    },
    {
    "code": {
    "id": "box12.1.code",
    "label": "Code",
    "value": "DD",
    "confidence": 1,
    "validated": false,
    "anchor": null
    },
    "amount": {
    "id": "box12.1.amount",
    "label": "Amount",
    "value": 8420.36,
    "confidence": 1,
    "validated": false,
    "anchor": null
    }
    }
    ],
    "box13": {
    "statutoryEmployee": {
    "id": "box13.statutoryEmployee",
    "label": "Statutory Employee",
    "value": false,
    "confidence": 1,
    "validated": false,
    "anchor": null
    },
    "retirementPlan": {
    "id": "box13.retirementPlan",
    "label": "Retirement Plan",
    "value": true,
    "confidence": 1,
    "validated": false,
    "anchor": null
    },
    "thirdPartySickPay": {
    "id": "box13.thirdPartySickPay",
    "label": "Third Party Sick Pay",
    "value": false,
    "confidence": 1,
    "validated": false,
    "anchor": null
    }
    },
    "box14": [
    {
    "label": {
    "id": "box14.0.label",
    "label": "Label",
    "value": "Union dues",
    "confidence": 1,
    "validated": false,
    "anchor": null
    },
    "amount": {
    "id": "box14.0.amount",
    "label": "Amount",
    "value": 360.00,
    "confidence": 1,
    "validated": false,
    "anchor": null
    }
    },
    {
    "label": {
    "id": "box14.1.label",
    "label": "Label",
    "value": "HSA ER",
    "confidence": 1,
    "validated": false,
    "anchor": null
    },
    "amount": {
    "id": "box14.1.amount",
    "label": "Amount",
    "value": 1200.00,
    "confidence": 1,
    "validated": false,
    "anchor": null
    }
    }
    ],
    "states": [
    {
    "state": {
    "id": "states.0.state",
    "label": "State",
    "value": "IL",
    "confidence": 1,
    "validated": false,
    "anchor": null
    },
    "employerStateId": {
    "id": "states.0.employerStateId",
    "label": "Employer State ID",
    "value": "IL-1234567",
    "confidence": 1,
    "validated": false,
    "anchor": null
    },
    "stateWages": {
    "id": "states.0.stateWages",
    "label": "State Wages",
    "value": 86500.25,
    "confidence": 1,
    "validated": false,
    "anchor": null
    },
    "stateIncomeTax": {
    "id": "states.0.stateIncomeTax",
    "label": "State Income Tax",
    "value": 3350.00,
    "confidence": 1,
    "validated": false,
    "anchor": null
    },
    "localities": [
    {
    "localityName": {
    "id": "states.0.localities.0.localityName",
    "label": "Locality Name",
    "value": "Springfield",
    "confidence": 1,
    "validated": false,
    "anchor": null
    },
    "localWages": {
    "id": "states.0.localities.0.localWages",
    "label": "Local Wages",
    "value": 86500.25,
    "confidence": 1,
    "validated": false,
    "anchor": null
    },
    "localIncomeTax": {
    "id": "states.0.localities.0.localIncomeTax",
    "label": "Local Income Tax",
    "value": 250.00,
    "confidence": 1,
    "validated": false,
    "anchor": null
    }
    }
    ]
    }
    ],
    "notes": "Multiple state/local lines allowed; amounts are decimals in USD."
    }
    };