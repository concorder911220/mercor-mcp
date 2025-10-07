export const W2ExtractSonnet = [
    {
      "id": "w2-2010-0001",
      "clientId": "sara-randall-001",
      "docType": "W2",
      "fileName": "W2_Sara_Randall_2010_Copy_B.pdf",
      "status": "EXTRACTED",
      "uploadedDate": "2025-02-20",
      "required": true,
      "extractedData": {
        "meta": {
          "taxYear": 2010,
          "copy": "B",
          "reissued": true,
          "controlNumber": "1357564"
        },
        "employee": {
          "employeeSsn": "581-70-3222",
          "name": {
            "first": "Sara",
            "middle": null,
            "last": "Randall",
            "suffix": null
          },
          "address": {
            "street": "0488 Erin Knoll",
            "city": "Lake Corey",
            "state": "SD",
            "zip": "60228-2982"
          }
        },
        "employer": {
          "employerEin": "36-2070087",
          "name": "Davis Group LLC",
          "address": {
            "street": "2500 Jason Row",
            "city": "North Ronald",
            "state": "MO",
            "zip": "58361-1378"
          }
        },
        "federal": {
          "wagesTipsOtherComp": 248530.86,
          "federalIncomeTaxWithheld": 39081.08,
          "socialSecurityWages": 194678.78,
          "socialSecurityTaxWithheld": 14892.93,
          "medicareWagesAndTips": 224705.04,
          "medicareTaxWithheld": 6516.45,
          "socialSecurityTips": 194678.78,
          "allocatedTips": 224705.04,
          "dependentCareBenefits": 295,
          "nonqualifiedPlans": 101
        },
        "box12": [
          { "code": "D", "amount": 7125 }
        ],
        "box13": {
          "statutoryEmployee": false,
          "retirementPlan": true,
          "thirdPartySickPay": false
        },
        "box14": [
          { "label": "G", "amount": 583 },
          { "label": "", "amount": 145 }
        ],
        "states": [
          {
            "state": "MD",
            "employerStateId": "248-39-070",
            "stateWages": 114593.63,
            "stateIncomeTax": 9799.81,
            "localities": [
              {
                "localityName": "Fisher Ridge",
                "localWages": 318229.98,
                "localIncomeTax": 32401.39
              }
            ]
          },
          {
            "state": "NE",
            "employerStateId": "165-28-859",
            "stateWages": 113115.7,
            "stateIncomeTax": 7086.1,
            "localities": [
              {
                "localityName": "Jefferson Ways",
                "localWages": 284992.22,
                "localIncomeTax": 28277.73
              }
            ]
          }
        ],
        "notes": "Reissued statement for 2010 tax year"
      },
      "extractedFields": [
        {
          "id": "ssn",
          "label": "Employee SSN",
          "value": "581-70-3222",
          "confidence": 1.0,
          "validated": true,
          "anchor": {
            "id": "ssn-anchor",
            "page": 1,
            "rect": { "x": 280, "y": 45, "w": 90, "h": 15 }
          }
        },
        {
          "id": "ein",
          "label": "Employer EIN",
          "value": "36-2070087",
          "confidence": 1.0,
          "validated": true,
          "anchor": {
            "id": "ein-anchor",
            "page": 1,
            "rect": { "x": 60, "y": 95, "w": 85, "h": 15 }
          }
        },
        {
          "id": "wages",
          "label": "Wages, tips, other comp",
          "value": 248530.86,
          "confidence": 1.0,
          "validated": true,
          "anchor": {
            "id": "wages-anchor",
            "page": 1,
            "rect": { "x": 380, "y": 95, "w": 85, "h": 15 }
          }
        },
        {
          "id": "fed-tax",
          "label": "Federal income tax withheld",
          "value": 39081.08,
          "confidence": 1.0,
          "validated": true,
          "anchor": {
            "id": "fed-tax-anchor",
            "page": 1,
            "rect": { "x": 480, "y": 95, "w": 85, "h": 15 }
          }
        },
        {
          "id": "ss-wages",
          "label": "Social security wages",
          "value": 194678.78,
          "confidence": 1.0,
          "validated": true,
          "anchor": {
            "id": "ss-wages-anchor",
            "page": 1,
            "rect": { "x": 380, "y": 115, "w": 85, "h": 15 }
          }
        },
        {
          "id": "ss-tax",
          "label": "Social security tax withheld",
          "value": 14892.93,
          "confidence": 1.0,
          "validated": true,
          "anchor": {
            "id": "ss-tax-anchor",
            "page": 1,
            "rect": { "x": 480, "y": 115, "w": 85, "h": 15 }
          }
        },
        {
          "id": "medicare-wages",
          "label": "Medicare wages and tips",
          "value": 224705.04,
          "confidence": 1.0,
          "validated": true,
          "anchor": {
            "id": "medicare-wages-anchor",
            "page": 1,
            "rect": { "x": 380, "y": 135, "w": 85, "h": 15 }
          }
        },
        {
          "id": "medicare-tax",
          "label": "Medicare tax withheld",
          "value": 6516.45,
          "confidence": 1.0,
          "validated": true,
          "anchor": {
            "id": "medicare-tax-anchor",
            "page": 1,
            "rect": { "x": 480, "y": 135, "w": 85, "h": 15 }
          }
        },
        {
          "id": "box12-d",
          "label": "Box 12 Code D",
          "value": 7125,
          "confidence": 1.0,
          "validated": true,
          "anchor": {
            "id": "box12-d-anchor",
            "page": 1,
            "rect": { "x": 480, "y": 195, "w": 50, "h": 15 }
          }
        },
        {
          "id": "state-md",
          "label": "MD State wages",
          "value": 114593.63,
          "confidence": 1.0,
          "validated": true,
          "anchor": {
            "id": "state-md-anchor",
            "page": 1,
            "rect": { "x": 180, "y": 250, "w": 85, "h": 15 }
          }
        },
        {
          "id": "state-ne",
          "label": "NE State wages",
          "value": 113115.7,
          "confidence": 1.0,
          "validated": true,
          "anchor": {
            "id": "state-ne-anchor",
            "page": 1,
            "rect": { "x": 180, "y": 270, "w": 85, "h": 15 }
          }
        }
      ]
    },
    {
      "id": "w2-2010-0002",
      "clientId": "sara-randall-001",
      "docType": "W2",
      "fileName": "W2_Sara_Randall_2010_Copy_C.pdf",
      "status": "EXTRACTED",
      "uploadedDate": "2025-02-20",
      "required": true,
      "extractedData": {
        "meta": {
          "taxYear": 2010,
          "copy": "C",
          "reissued": true,
          "controlNumber": "1357564"
        },
        "employee": {
          "employeeSsn": "581-70-3222",
          "name": {
            "first": "Sara",
            "middle": null,
            "last": "Randall",
            "suffix": null
          },
          "address": {
            "street": "0488 Erin Knoll",
            "city": "Lake Corey",
            "state": "SD",
            "zip": "60228-2982"
          }
        },
        "employer": {
          "employerEin": "36-2070087",
          "name": "Davis Group LLC",
          "address": {
            "street": "2500 Jason Row",
            "city": "North Ronald",
            "state": "MO",
            "zip": "58361-1378"
          }
        },
        "federal": {
          "wagesTipsOtherComp": 248530.86,
          "federalIncomeTaxWithheld": 39081.08,
          "socialSecurityWages": 194678.78,
          "socialSecurityTaxWithheld": 14892.93,
          "medicareWagesAndTips": 224705.04,
          "medicareTaxWithheld": 6516.45,
          "socialSecurityTips": 194678.78,
          "allocatedTips": 224705.04,
          "dependentCareBenefits": 295,
          "nonqualifiedPlans": 101
        },
        "box12": [
          { "code": "D", "amount": 7125 }
        ],
        "box13": {
          "statutoryEmployee": false,
          "retirementPlan": true,
          "thirdPartySickPay": false
        },
        "box14": [
          { "label": "G", "amount": 583 },
          { "label": "", "amount": 145 }
        ],
        "states": [
          {
            "state": "MD",
            "employerStateId": "248-39-070",
            "stateWages": 114593.63,
            "stateIncomeTax": 9799.81,
            "localities": [
              {
                "localityName": "Fisher Ridge",
                "localWages": 318229.98,
                "localIncomeTax": 32401.39
              }
            ]
          },
          {
            "state": "NE",
            "employerStateId": "165-28-859",
            "stateWages": 113115.7,
            "stateIncomeTax": 7086.1,
            "localities": [
              {
                "localityName": "Jefferson Ways",
                "localWages": 284992.22,
                "localIncomeTax": 28277.73
              }
            ]
          }
        ],
        "notes": "Copy C for Employee's Records"
      },
      "extractedFields": [
        {
          "id": "ssn-2",
          "label": "Employee SSN",
          "value": "581-70-3222",
          "confidence": 1.0,
          "validated": true,
          "anchor": {
            "id": "ssn-anchor-2",
            "page": 1,
            "rect": { "x": 280, "y": 345, "w": 90, "h": 15 }
          }
        },
        {
          "id": "ein-2",
          "label": "Employer EIN",
          "value": "36-2070087",
          "confidence": 1.0,
          "validated": true,
          "anchor": {
            "id": "ein-anchor-2",
            "page": 1,
            "rect": { "x": 60, "y": 395, "w": 85, "h": 15 }
          }
        },
        {
          "id": "wages-2",
          "label": "Wages, tips, other comp",
          "value": 248530.86,
          "confidence": 1.0,
          "validated": true,
          "anchor": {
            "id": "wages-anchor-2",
            "page": 1,
            "rect": { "x": 380, "y": 395, "w": 85, "h": 15 }
          }
        },
        {
          "id": "fed-tax-2",
          "label": "Federal income tax withheld",
          "value": 39081.08,
          "confidence": 1.0,
          "validated": true,
          "anchor": {
            "id": "fed-tax-anchor-2",
            "page": 1,
            "rect": { "x": 480, "y": 395, "w": 85, "h": 15 }
          }
        },
        {
          "id": "ss-wages-2",
          "label": "Social security wages",
          "value": 194678.78,
          "confidence": 1.0,
          "validated": true,
          "anchor": {
            "id": "ss-wages-anchor-2",
            "page": 1,
            "rect": { "x": 380, "y": 415, "w": 85, "h": 15 }
          }
        },
        {
          "id": "ss-tax-2",
          "label": "Social security tax withheld",
          "value": 14892.93,
          "confidence": 1.0,
          "validated": true,
          "anchor": {
            "id": "ss-tax-anchor-2",
            "page": 1,
            "rect": { "x": 480, "y": 415, "w": 85, "h": 15 }
          }
        },
        {
          "id": "medicare-wages-2",
          "label": "Medicare wages and tips",
          "value": 224705.04,
          "confidence": 1.0,
          "validated": true,
          "anchor": {
            "id": "medicare-wages-anchor-2",
            "page": 1,
            "rect": { "x": 380, "y": 435, "w": 85, "h": 15 }
          }
        },
        {
          "id": "medicare-tax-2",
          "label": "Medicare tax withheld",
          "value": 6516.45,
          "confidence": 1.0,
          "validated": true,
          "anchor": {
            "id": "medicare-tax-anchor-2",
            "page": 1,
            "rect": { "x": 480, "y": 435, "w": 85, "h": 15 }
          }
        },
        {
          "id": "box12-d-2",
          "label": "Box 12 Code D",
          "value": 7125,
          "confidence": 1.0,
          "validated": true,
          "anchor": {
            "id": "box12-d-anchor-2",
            "page": 1,
            "rect": { "x": 480, "y": 495, "w": 50, "h": 15 }
          }
        },
        {
          "id": "state-md-2",
          "label": "MD State wages",
          "value": 114593.63,
          "confidence": 1.0,
          "validated": true,
          "anchor": {
            "id": "state-md-anchor-2",
            "page": 1,
            "rect": { "x": 180, "y": 550, "w": 85, "h": 15 }
          }
        },
        {
          "id": "state-ne-2",
          "label": "NE State wages",
          "value": 113115.7,
          "confidence": 1.0,
          "validated": true,
          "anchor": {
            "id": "state-ne-anchor-2",
            "page": 1,
            "rect": { "x": 180, "y": 570, "w": 85, "h": 15 }
          }
        }
      ]
    }
  ];