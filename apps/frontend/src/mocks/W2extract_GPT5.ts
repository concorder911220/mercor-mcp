export const W2ExtractGPT5 = {
    "id": "w2-2010-sara-randall",
    "clientId": "client-sara-randall",
    "docType": "W2",
    "fileName": "W2_sample.pdf",
    "status": "EXTRACTED",
    "uploadedDate": "2011-01-31",
    "required": true,
    "extractedData": {
      "meta": {
        "taxYear": 2010,
        "copy": "B",
        "reissued": true,
        "controlNumber": {
          "id": "controlNumber",
          "label": "Control Number",
          "value": "1357564",
          "confidence": 0.95,
          "validated": true,
          "anchor": {
            "id": "controlNumber",
            "page": 1,
            "rect": { "x": 0.15, "y": 0.08, "w": 0.2, "h": 0.03 }
          }
        }
      },
      "employee": {
        "employeeSsn": {
          "id": "employeeSsn",
          "label": "Employee SSN",
          "value": "581-70-3222",
          "confidence": 0.99,
          "validated": true,
          "anchor": {
            "id": "employeeSsn",
            "page": 1,
            "rect": { "x": 0.05, "y": 0.08, "w": 0.25, "h": 0.03 }
          }
        },
        "name": {
          "id": "employeeName",
          "label": "Employee Name",
          "value": "Sara Randall",
          "confidence": 0.99,
          "validated": true,
          "anchor": {
            "id": "employeeName",
            "page": 1,
            "rect": { "x": 0.05, "y": 0.70, "w": 0.4, "h": 0.03 }
          }
        },
        "address": {
          "id": "employeeAddress",
          "label": "Employee Address",
          "value": "0488 Erin Knoll, Lake Corey, SD 60228-2982",
          "confidence": 0.99,
          "validated": true,
          "anchor": {
            "id": "employeeAddress",
            "page": 1,
            "rect": { "x": 0.05, "y": 0.74, "w": 0.45, "h": 0.06 }
          }
        }
      },
      "employer": {
        "employerEin": {
          "id": "employerEin",
          "label": "Employer EIN",
          "value": "36-2070087",
          "confidence": 0.99,
          "validated": true,
          "anchor": {
            "id": "employerEin",
            "page": 1,
            "rect": { "x": 0.55, "y": 0.08, "w": 0.25, "h": 0.03 }
          }
        },
        "nameAddress": {
          "id": "employerNameAddress",
          "label": "Employer Name and Address",
          "value": "Davis Group LLC, 2500 Jason Row, North Ronald, MO 58361-1378",
          "confidence": 0.99,
          "validated": true,
          "anchor": {
            "id": "employerNameAddress",
            "page": 1,
            "rect": { "x": 0.55, "y": 0.12, "w": 0.4, "h": 0.08 }
          }
        }
      },
      "federal": {
        "wagesTipsOtherComp": {
          "id": "wagesTips",
          "label": "Wages, tips, other compensation",
          "value": 248530.86,
          "confidence": 0.98,
          "validated": true,
          "anchor": {
            "id": "wagesTips",
            "page": 1,
            "rect": { "x": 0.15, "y": 0.20, "w": 0.2, "h": 0.03 }
          }
        },
        "federalIncomeTaxWithheld": {
          "id": "federalTax",
          "label": "Federal Income Tax Withheld",
          "value": 39081.08,
          "confidence": 0.98,
          "validated": true,
          "anchor": {
            "id": "federalTax",
            "page": 1,
            "rect": { "x": 0.40, "y": 0.20, "w": 0.2, "h": 0.03 }
          }
        },
        "socialSecurityWages": {
          "id": "ssWages",
          "label": "Social Security Wages",
          "value": 194678.78,
          "confidence": 0.98,
          "validated": true,
          "anchor": {
            "id": "ssWages",
            "page": 1,
            "rect": { "x": 0.15, "y": 0.25, "w": 0.2, "h": 0.03 }
          }
        },
        "socialSecurityTaxWithheld": {
          "id": "ssTax",
          "label": "Social Security Tax Withheld",
          "value": 14892.93,
          "confidence": 0.98,
          "validated": true,
          "anchor": {
            "id": "ssTax",
            "page": 1,
            "rect": { "x": 0.40, "y": 0.25, "w": 0.2, "h": 0.03 }
          }
        },
        "medicareWagesAndTips": {
          "id": "medicareWages",
          "label": "Medicare Wages and Tips",
          "value": 224705.04,
          "confidence": 0.98,
          "validated": true,
          "anchor": {
            "id": "medicareWages",
            "page": 1,
            "rect": { "x": 0.15, "y": 0.30, "w": 0.2, "h": 0.03 }
          }
        },
        "medicareTaxWithheld": {
          "id": "medicareTax",
          "label": "Medicare Tax Withheld",
          "value": 6516.45,
          "confidence": 0.98,
          "validated": true,
          "anchor": {
            "id": "medicareTax",
            "page": 1,
            "rect": { "x": 0.40, "y": 0.30, "w": 0.2, "h": 0.03 }
          }
        }
      },
      "box12": [
        { "code": "D", "amount": 7125, "anchor": { "id": "box12a", "page": 1, "rect": { "x": 0.65, "y": 0.40, "w": 0.15, "h": 0.03 } } },
        { "code": "12", "amount": 296, "anchor": { "id": "box12b", "page": 1, "rect": { "x": 0.65, "y": 0.44, "w": 0.15, "h": 0.03 } } },
        { "code": "G", "amount": 583, "anchor": { "id": "box12c", "page": 1, "rect": { "x": 0.65, "y": 0.48, "w": 0.15, "h": 0.03 } } },
        { "code": "12", "amount": 145, "anchor": { "id": "box12d", "page": 1, "rect": { "x": 0.65, "y": 0.52, "w": 0.15, "h": 0.03 } } }
      ],
      "box13": {
        "statutoryEmployee": { "value": false, "anchor": { "id": "box13a", "page": 1, "rect": { "x": 0.15, "y": 0.36, "w": 0.02, "h": 0.02 } } },
        "retirementPlan": { "value": true, "anchor": { "id": "box13b", "page": 1, "rect": { "x": 0.22, "y": 0.36, "w": 0.02, "h": 0.02 } } },
        "thirdPartySickPay": { "value": false, "anchor": { "id": "box13c", "page": 1, "rect": { "x": 0.29, "y": 0.36, "w": 0.02, "h": 0.02 } } }
      },
      "states": [
        {
          "state": "MD",
          "employerStateId": "248-39-070",
          "stateWages": 114593.63,
          "stateIncomeTax": 9799.81,
          "anchor": {
            "id": "state1",
            "page": 1,
            "rect": { "x": 0.10, "y": 0.85, "w": 0.35, "h": 0.04 }
          }
        },
        {
          "state": "NE",
          "employerStateId": "165-28-859",
          "stateWages": 113115.7,
          "stateIncomeTax": 7086.1,
          "anchor": {
            "id": "state2",
            "page": 1,
            "rect": { "x": 0.10, "y": 0.90, "w": 0.35, "h": 0.04 }
          }
        }
      ],
      "localities": [
        {
          "localityName": "Fisher Ridge",
          "localWages": 284992.22,
          "localIncomeTax": 28277.73,
          "anchor": {
            "id": "locality1",
            "page": 1,
            "rect": { "x": 0.55, "y": 0.90, "w": 0.35, "h": 0.04 }
          }
        }
      ]
    }
  };