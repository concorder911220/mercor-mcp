import { TaxClient, TaxDocument, ClientStatus, DocumentStatus, DocumentFlag } from "../types/tax";

// Mock tax filings
export const mockClients: TaxClient[] = [
  {
    id: "filing-001",
    clientId: "client-001",
    name: "Sara Randall",
    status: ClientStatus.ReadyToReview,
    lastUpdated: "2025-02-20",
    email: "sara.randall@gmail.com",
    phone: "(555) 123-4567",
    taxYear: 2024,
    assignedTo: "Agent Smith",
    preferredName: "Sara",
    address: "123 Main Street\nAnytown, MD 20001",
    ssn: "***-**-1234",
    emergencyContact: "John Randall",
    emergencyPhone: "(555) 123-4568",
    communicationPreference: "email"
  },
  {
    id: "filing-006",
    clientId: "client-006",
    name: "Michele Herbert",
    status: ClientStatus.MissingDocuments,
    lastUpdated: "2025-02-25",
    email: "michele.herbert@gmail.com",
    phone: "(555) 678-9012",
    taxYear: 2024,
    assignedTo: "Agent Smith",
    preferredName: "Michele",
    address: "456 Oak Street\nSpringfield, IL 62701",
    ssn: "***-**-5678",
    emergencyContact: "Robert Herbert",
    emergencyPhone: "(555) 678-9013",
    communicationPreference: "email"
  },
  {
    id: "filing-002",
    clientId: "client-002",
    name: "David Morris",
    status: ClientStatus.MissingDocuments,
    lastUpdated: "2025-02-15",
    email: "david.morris@icloud.com",
    phone: "(555) 234-5678",
    taxYear: 2024,
    assignedTo: "Agent Jones"
  },
  {
    id: "filing-003",
    clientId: "client-003",
    name: "Emily Chen",
    status: ClientStatus.ReadyToReview,
    lastUpdated: "2025-02-22",
    email: "emily.chen@yahoo.com",
    phone: "(555) 345-6789",
    taxYear: 2024,
    assignedTo: "Agent Smith"
  },
  {
    id: "filing-004",
    clientId: "client-004",
    name: "Michael Johnson",
    status: ClientStatus.InReview,
    lastUpdated: "2025-02-23",
    email: "michael.j@hotmail.com",
    phone: "(555) 456-7890",
    taxYear: 2024,
    assignedTo: "CPA Williams"
  },
  {
    id: "filing-005",
    clientId: "client-005",
    name: "Jennifer Davis",
    status: ClientStatus.ReturnFiled,
    lastUpdated: "2025-02-10",
    email: "jennifer.davis@outlook.com",  
    phone: "(555) 567-8901",
    taxYear: 2024,
    assignedTo: "CPA Brown"
  }
];

// Mock documents for Sara Randall
export const mockDocuments: Record<string, TaxDocument[]> = {
  "filing-001": [
    {
      id: "doc-001",
      clientId: "client-001",
      docType: "W-2",
      fileName: "W2_sample.pdf",
      filePath: "/sample-docs/W2_sample.pdf",
      status: DocumentStatus.Validated,
      uploadedDate: "2025-02-18",
      required: true,
      dropboxUrl: "https://www.dropbox.com/scl/fi/gpu4z8lo5h14d4qhlrmpk/W2_sample.pdf?rlkey=z0fe4d9fayy4o18lrcwpbi5mf&st=fjkiouww&dl=0"
    },
    {
      id: "doc-003",
      clientId: "client-001",
      docType: "1099-DIV (Vanguard)",
      fileName: "Vanguard 1099 FY24_sample.pdf",
      filePath: "/sample-docs/Vanguard 1099 FY24_sample.pdf",
      status: DocumentStatus.Validated,
      uploadedDate: "2025-02-19",
      required: true,
      dropboxUrl: "https://www.dropbox.com/scl/fi/n76m6l9cscqmboftjz9r4/Vanguard-1099-FY24_sample.pdf?rlkey=ugk80hh883u7wujml7as8v3lp&st=tmw0u3tn&dl=0"
    },
    {
      id: "doc-002",
      clientId: "client-001",
      docType: "1099-DIV (Schwab)",
      fileName: "Schwab 1099 FY24_sample.pdf",
      filePath: "/sample-docs/Schwab 1099 FY24_sample.pdf",
      status: DocumentStatus.Validated,
      uploadedDate: "2025-02-17",
      required: true,
      dropboxUrl: "https://www.dropbox.com/scl/fi/7af643gjf3j0p24s1iajg/Schwab-1099-FY24_sample.pdf?rlkey=ulavxmjxgc22oifa77mimtbu6&st=zu0bz5i3&dl=0"
    },
    {
      id: "doc-004",
      clientId: "client-001",
      docType: "K-1",
      fileName: "2024US SWICK CAPITAL K1_sample.pdf",
      filePath: "/sample-docs/2024US SWICK CAPITAL K1_sample.pdf",
      status: DocumentStatus.Validated,
      uploadedDate: "2025-02-21",
      required: true,
      dropboxUrl: "https://www.dropbox.com/scl/fi/l8auqjr2gf58o2icvcln7/2024US-SWICK-CAPITAL-K1_sample.pdf?rlkey=nzq4cd37n883sj9aquvnev8jh&st=wjryvppr&dl=0"
    },
    {
      id: "doc-005",
      clientId: "client-001",
      docType: "Donation Receipts",
      fileName: "Ocean Cleanup Donation_sample.pdf",
      filePath: "/sample-docs/Ocean Cleanup Donation_sample.pdf",
      status: DocumentStatus.Validated,
      uploadedDate: "2025-02-20",
      required: false,
      dropboxUrl: "https://www.dropbox.com/scl/fi/ec7rgfjvm8d5qa5flovlu/Ocean-Cleanup-Donation_sample.pdf?rlkey=35c1jdjo1ocudjta39mjsz8jv&st=89nx35kl&dl=0"
    },
    {
      id: "doc-006",
      clientId: "client-001",
      docType: "Organizer",
      fileName: "2024 Financial Organizer - Sample.docx.pdf",
      filePath: "/sample-docs/2024 Financial Organizer - Sample.docx.pdf",
      status: DocumentStatus.Validated,
      uploadedDate: "2025-02-10",
      required: true,
      dropboxUrl: "https://www.dropbox.com/scl/fi/macdxzxtp2q15ouh4ubcw/2024-Financial-Organizer-Sample.docx.pdf?rlkey=p51ym369lr7oy5k99rh0qypsv&st=niqzn8c3&dl=0"
    },
    {
      id: "doc-007",
      clientId: "client-001",
      docType: "Coinbase Transactions",
      fileName: "Coinbase-transactions_sample.csv",
      filePath: "/sample-docs/Coinbase-transactions_sample.csv",
      status: DocumentStatus.Validated,
      uploadedDate: "2025-02-19",
      required: false,
      dropboxUrl: "https://www.dropbox.com/scl/fi/wdg6p5pzs5xuga7bxgj1q/Coinbase-transactions_sample.csv?rlkey=u6fpzvcn194ohp3pc437av4rc&st=7mc5zljg&dl=0"
    }
  ],
  "filing-002": [
    {
      id: "doc-008",
      clientId: "client-002",
      docType: "W-2",
      fileName: undefined,
      filePath: undefined,
      status: DocumentStatus.NotReceived,
      uploadedDate: null,
      required: true
    },
    {
      id: "doc-009",
      clientId: "client-002",
      docType: "1099-DIV",
      fileName: undefined,
      filePath: undefined,
      status: DocumentStatus.NotReceived,
      uploadedDate: null,
      required: true
    },
    {
      id: "doc-010",
      clientId: "client-002",
      docType: "Organizer",
      fileName: "organizer_david.pdf",
      filePath: "/sample-docs/2024 Financial Organizer - Sample.docx.pdf",
      status: DocumentStatus.Validated,
      uploadedDate: "2025-02-05",
      required: true
    }
  ],
  "filing-003": [
    {
      id: "doc-011",
      clientId: "client-003",
      docType: "W-2",
      fileName: "w2_emily.pdf",
      filePath: "/sample-docs/W2_sample.pdf",
      status: DocumentStatus.Validated,
      uploadedDate: "2025-02-20",
      required: true
    },
    {
      id: "doc-012",
      clientId: "client-003",
      docType: "1099-INT",
      fileName: "1099int_emily.pdf",
      filePath: "/sample-docs/Schwab 1099 FY24_sample.pdf",
      status: DocumentStatus.Validated,
      uploadedDate: "2025-02-21",
      required: true
    },
    {
      id: "doc-013",
      clientId: "client-003",
      docType: "Organizer",
      fileName: "organizer_emily.pdf",
      filePath: "/sample-docs/2024 Financial Organizer - Sample.docx.pdf",
      status: DocumentStatus.Validated,
      uploadedDate: "2025-02-15",
      required: true
    }
  ],
  "filing-006": [
    {
      id: "doc-014",
      clientId: "client-006",
      docType: "W-2",
      fileName: "MicheleHebert_W2.pdf",
      filePath: "/sample-docs/W2_sample.pdf",
      status: DocumentStatus.Validated,
      uploadedDate: "2025-02-23",
      required: true
    },
    {
      id: "doc-015",
      clientId: "client-006",
      docType: "1099-DIV (Schwab)",
      fileName: "Schwab.pdf",
      filePath: "/sample-docs/Schwab 1099 FY24_sample.pdf",
      status: DocumentStatus.NeedsReupload,
      uploadedDate: "2025-02-22",
      required: true,
      flags: [DocumentFlag.WrongTaxYear]
    },
    {
      id: "doc-016",
      clientId: "client-006",
      docType: "Donation Receipts",
      fileName: "Salvation Army Donations_sample.pdf",
      filePath: "/sample-docs/Ocean Cleanup Donation_sample.pdf",
      status: DocumentStatus.Validated,
      uploadedDate: "2025-02-21",
      required: false
    },
    {
      id: "doc-017",
      clientId: "client-006",
      docType: "Prior Year Tax Return",
      fileName: "Michele_Hebert_2023_Tax_Return.pdf",
      filePath: "/sample-docs/2024 Financial Organizer - Sample.docx.pdf",
      status: DocumentStatus.Validated,
      uploadedDate: "2025-02-20",
      required: true
    },
    {
      id: "doc-018",
      clientId: "client-006",
      docType: "1098 (Mortgage Interest)",
      fileName: undefined,
      filePath: undefined,
      status: DocumentStatus.NotReceived,
      uploadedDate: null,
      required: true
    }
  ]
};

// Extracted data for Sara Randall's W-2 (with Reducto AI citations)
export const mockExtractedData = {
  "doc-001": [
    {
      "type": "object",
      "label": "Box12 Codes",
      "reference": {
        "path": "box12Codes",
        "depth": 1
      },
      "children": [
        {
          "type": "field",
          "label": "Amount12A",
          "reference": {
            "path": "box12Codes.amount12a",
            "depth": 2
          },
          "value": {
            "original": "7125",
            "current": "7125"
          },
          "boundingBox": {
            "left": 0.821078431372549,
            "top": 0.23674242424242425,
            "width": 0.039215686274509776,
            "height": 0.008207070707070718,
            "page": 1
          },
          "subtype": "number",
          "confidence": {
            "level": "high"
          }
        },
        {
          "type": "field",
          "label": "Amount12B",
          "reference": {
            "path": "box12Codes.amount12b",
            "depth": 2
          },
          "value": {
            "original": "296",
            "current": "296"
          },
          "boundingBox": {
            "left": 0.8202614379084967,
            "top": 0.26641414141414144,
            "width": 0.030228758169934644,
            "height": 0.008838383838383812,
            "page": 1
          },
          "subtype": "number",
          "confidence": {
            "level": "high"
          }
        },
        {
          "type": "field",
          "label": "Amount12C",
          "reference": {
            "path": "box12Codes.amount12c",
            "depth": 2
          },
          "value": {
            "original": "583",
            "current": "583"
          },
          "boundingBox": {
            "left": 0.8202614379084967,
            "top": 0.29987373737373735,
            "width": 0.029411764705882353,
            "height": 0.010101010101010102,
            "page": 1
          },
          "subtype": "number",
          "confidence": {
            "level": "high"
          }
        },
        {
          "type": "field",
          "label": "Amount12D",
          "reference": {
            "path": "box12Codes.amount12d",
            "depth": 2
          },
          "value": {
            "original": "145",
            "current": "145"
          },
          "boundingBox": {
            "left": 0.8194444444444444,
            "top": 0.32765151515151514,
            "width": 0.0326797385620915,
            "height": 0.013888888888888895,
            "page": 1
          },
          "subtype": "number",
          "confidence": {
            "level": "high"
          }
        },
        {
          "type": "field",
          "label": "Code12A",
          "reference": {
            "path": "box12Codes.code12a",
            "depth": 2
          },
          "value": {
            "original": "D",
            "current": "D"
          },
          "boundingBox": {
            "left": 0.7883986928104575,
            "top": 0.23674242424242425,
            "width": 0.008169934640522876,
            "height": 0.007575757575757576,
            "page": 1
          },
          "subtype": "string",
          "confidence": {
            "level": "high"
          }
        },
        {
          "type": "field",
          "label": "Code12C",
          "reference": {
            "path": "box12Codes.code12c",
            "depth": 2
          },
          "value": {
            "original": "G",
            "current": "G"
          },
          "boundingBox": {
            "left": 0.7883986928104575,
            "top": 0.29987373737373735,
            "width": 0.008986928104575163,
            "height": 0.010101010101010102,
            "page": 1
          },
          "subtype": "string",
          "confidence": {
            "level": "high"
          }
        }
      ]
    },
    {
      "type": "object",
      "label": "Box13 Checkboxes",
      "reference": {
        "path": "box13Checkboxes",
        "depth": 1
      },
      "children": [
        {
          "type": "field",
          "label": "Retirement Plan",
          "reference": {
            "path": "box13Checkboxes.retirementPlan",
            "depth": 2
          },
          "value": {
            "original": "True",
            "current": "True"
          },
          "boundingBox": {
            "left": 0.5563725490196079,
            "top": 0.26704545454545453,
            "width": 0.011437908496732025,
            "height": 0.008838383838383838,
            "page": 1
          },
          "subtype": "boolean",
          "confidence": {
            "level": "high"
          }
        },
        {
          "type": "field",
          "label": "Statutory Employee",
          "reference": {
            "path": "box13Checkboxes.statutoryEmployee",
            "depth": 2
          },
          "value": {
            "original": "True",
            "current": "True"
          },
          "boundingBox": {
            "left": 0.5563725490196079,
            "top": 0.26704545454545453,
            "width": 0.011437908496732025,
            "height": 0.008838383838383838,
            "page": 1
          },
          "subtype": "boolean",
          "confidence": {
            "level": "high"
          }
        },
        {
          "type": "field",
          "label": "Third Party Sick Pay",
          "reference": {
            "path": "box13Checkboxes.thirdPartySickPay",
            "depth": 2
          },
          "value": {
            "original": "False",
            "current": "False"
          },
          "boundingBox": {
            "left": 0.5563725490196079,
            "top": 0.26704545454545453,
            "width": 0.011437908496732025,
            "height": 0.008838383838383838,
            "page": 1
          },
          "subtype": "boolean",
          "confidence": {
            "level": "high"
          }
        }
      ]
    },
    {
      "type": "field",
      "label": "Control Number",
      "reference": {
        "path": "controlNumber",
        "depth": 1
      },
      "value": {
        "original": "1357564",
        "current": "1357564"
      },
      "boundingBox": {
        "left": 0.08415032679738563,
        "top": 0.20454545454545456,
        "width": 0.07107843137254902,
        "height": 0.00883838383838384,
        "page": 1
      },
      "subtype": "number",
      "confidence": {
        "level": "high"
      }
    },
    {
      "type": "object",
      "label": "Employee",
      "reference": {
        "path": "employee",
        "depth": 1
      },
      "children": [
        {
          "type": "field",
          "label": "Employee Address",
          "reference": {
            "path": "employee.employeeAddress",
            "depth": 2
          },
          "value": {
            "original": "0488 Erin Knoll Lake Corey SD 60228-2982",
            "current": "0488 Erin Knoll Lake Corey SD 60228-2982"
          },
          "boundingBox": {
            "left": 0.08415032679738563,
            "top": 0.26452020202020204,
            "width": 0.3415032679738562,
            "height": 0.03282828282828283,
            "page": 1
          },
          "subtype": "string",
          "confidence": {
            "level": "high"
          }
        },
        {
          "type": "field",
          "label": "Employee Name",
          "reference": {
            "path": "employee.employeeName",
            "depth": 2
          },
          "value": {
            "original": "Sara Randall",
            "current": "Sara Randall"
          },
          "boundingBox": {
            "left": 0.08415032679738563,
            "top": 0.24368686868686867,
            "width": 0.17973856209150327,
            "height": 0.011994949494949494,
            "page": 1
          },
          "subtype": "string",
          "confidence": {
            "level": "high"
          }
        },
        {
          "type": "field",
          "label": "Social Security Number",
          "reference": {
            "path": "employee.socialSecurityNumber",
            "depth": 2
          },
          "value": {
            "original": "581-70-3222",
            "current": "581-70-3222"
          },
          "boundingBox": {
            "left": 0.27124183006535946,
            "top": 0.06628787878787878,
            "width": 0.11029411764705882,
            "height": 0.010101010101010097,
            "page": 1
          },
          "subtype": "string",
          "confidence": {
            "level": "high"
          }
        }
      ]
    },
    {
      "type": "object",
      "label": "Employer",
      "reference": {
        "path": "employer",
        "depth": 1
      },
      "children": [
        {
          "type": "field",
          "label": "Employer Address",
          "reference": {
            "path": "employer.employerAddress",
            "depth": 2
          },
          "value": {
            "original": "2500 Jason Row North Ronald MO 58361-1378",
            "current": "2500 Jason Row North Ronald MO 58361-1378"
          },
          "boundingBox": {
            "left": 0.08169934640522876,
            "top": 0.1407828282828283,
            "width": 0.3488562091503268,
            "height": 0.028409090909090908,
            "page": 1
          },
          "subtype": "string",
          "confidence": {
            "level": "high"
          }
        },
        {
          "type": "field",
          "label": "Employer Identification Number",
          "reference": {
            "path": "employer.employerIdentificationNumber",
            "depth": 2
          },
          "value": {
            "original": "36-2070087",
            "current": "36-2070087"
          },
          "boundingBox": {
            "left": 0.08415032679738563,
            "top": 0.09532828282828283,
            "width": 0.10130718954248366,
            "height": 0.008207070707070704,
            "page": 1
          },
          "subtype": "string",
          "confidence": {
            "level": "high"
          }
        },
        {
          "type": "field",
          "label": "Employer Name",
          "reference": {
            "path": "employer.employerName",
            "depth": 2
          },
          "value": {
            "original": "Davis Group LLC",
            "current": "Davis Group LLC"
          },
          "boundingBox": {
            "left": 0.08251633986928104,
            "top": 0.12436868686868686,
            "width": 0.15522875816993464,
            "height": 0.011363636363636367,
            "page": 1
          },
          "subtype": "string",
          "confidence": {
            "level": "high"
          }
        }
      ]
    },
    {
      "type": "object",
      "label": "Federal Boxes",
      "reference": {
        "path": "federalBoxes",
        "depth": 1
      },
      "children": [
        {
          "type": "field",
          "label": "Allocated Tips",
          "reference": {
            "path": "federalBoxes.allocatedTips",
            "depth": 2
          },
          "value": {
            "original": "224705.04",
            "current": "224705.04"
          },
          "boundingBox": {
            "left": 0.8194444444444444,
            "top": 0.17676767676767677,
            "width": 0.0923202614379085,
            "height": 0.010101010101010102,
            "page": 1
          },
          "subtype": "number",
          "confidence": {
            "level": "high"
          }
        },
        {
          "type": "field",
          "label": "Dependent Care Benefits",
          "reference": {
            "path": "federalBoxes.dependentCareBenefits",
            "depth": 2
          },
          "value": {
            "original": "295",
            "current": "295"
          },
          "boundingBox": {
            "left": 0.8202614379084967,
            "top": 0.20454545454545456,
            "width": 0.028594771241830075,
            "height": 0.00883838383838384,
            "page": 1
          },
          "subtype": "number",
          "confidence": {
            "level": "high"
          }
        },
        {
          "type": "field",
          "label": "Federal Income Tax Withheld",
          "reference": {
            "path": "federalBoxes.federalIncomeTaxWithheld",
            "depth": 2
          },
          "value": {
            "original": "39081.08",
            "current": "39081.08"
          },
          "boundingBox": {
            "left": 0.7728758169934641,
            "top": 0.09532828282828283,
            "width": 0.08006535947712423,
            "height": 0.008207070707070704,
            "page": 1
          },
          "subtype": "number",
          "confidence": {
            "level": "high"
          }
        },
        {
          "type": "field",
          "label": "Medicare Tax Withheld",
          "reference": {
            "path": "federalBoxes.medicareTaxWithheld",
            "depth": 2
          },
          "value": {
            "original": "6516.45",
            "current": "6516.45"
          },
          "boundingBox": {
            "left": 0.821078431372549,
            "top": 0.15088383838383837,
            "width": 0.0702614379084967,
            "height": 0.008207070707070718,
            "page": 1
          },
          "subtype": "number",
          "confidence": {
            "level": "high"
          }
        },
        {
          "type": "field",
          "label": "Medicare Wages And Tips",
          "reference": {
            "path": "federalBoxes.medicareWagesAndTips",
            "depth": 2
          },
          "value": {
            "original": "224705.04",
            "current": "224705.04"
          },
          "boundingBox": {
            "left": 0.576797385620915,
            "top": 0.17676767676767677,
            "width": 0.0915032679738562,
            "height": 0.010101010101010102,
            "page": 1
          },
          "subtype": "number",
          "confidence": {
            "level": "high"
          }
        },
        {
          "type": "field",
          "label": "Nonqualified Plans",
          "reference": {
            "path": "federalBoxes.nonqualifiedPlans",
            "depth": 2
          },
          "value": {
            "original": "101",
            "current": "101"
          },
          "boundingBox": {
            "left": 0.5776143790849673,
            "top": 0.23674242424242425,
            "width": 0.028594771241830075,
            "height": 0.007575757575757569,
            "page": 1
          },
          "subtype": "number",
          "confidence": {
            "level": "high"
          }
        },
        {
          "type": "field",
          "label": "Social Security Tax Withheld",
          "reference": {
            "path": "federalBoxes.socialSecurityTaxWithheld",
            "depth": 2
          },
          "value": {
            "original": "14892.93",
            "current": "14892.93"
          },
          "boundingBox": {
            "left": 0.7728758169934641,
            "top": 0.12436868686868686,
            "width": 0.08088235294117652,
            "height": 0.008207070707070704,
            "page": 1
          },
          "subtype": "number",
          "confidence": {
            "level": "high"
          }
        },
        {
          "type": "field",
          "label": "Social Security Tips",
          "reference": {
            "path": "federalBoxes.socialSecurityTips",
            "depth": 2
          },
          "value": {
            "original": "194678.78",
            "current": "194678.78"
          },
          "boundingBox": {
            "left": 0.576797385620915,
            "top": 0.15782828282828282,
            "width": 0.0915032679738562,
            "height": 0.010732323232323232,
            "page": 1
          },
          "subtype": "number",
          "confidence": {
            "level": "high"
          }
        },
        {
          "type": "field",
          "label": "Social Security Wages",
          "reference": {
            "path": "federalBoxes.socialSecurityWages",
            "depth": 2
          },
          "value": {
            "original": "194678.78",
            "current": "194678.78"
          },
          "boundingBox": {
            "left": 0.576797385620915,
            "top": 0.12247474747474747,
            "width": 0.0915032679738562,
            "height": 0.010101010101010102,
            "page": 1
          },
          "subtype": "number",
          "confidence": {
            "level": "high"
          }
        },
        {
          "type": "field",
          "label": "Wages Tips Other Compensation",
          "reference": {
            "path": "federalBoxes.wagesTipsOtherCompensation",
            "depth": 2
          },
          "value": {
            "original": "248530.86",
            "current": "248530.86"
          },
          "boundingBox": {
            "left": 0.576797385620915,
            "top": 0.0946969696969697,
            "width": 0.09150326797385622,
            "height": 0.00883838383838384,
            "page": 1
          },
          "subtype": "number",
          "confidence": {
            "level": "high"
          }
        }
      ]
    },
    {
      "type": "list",
      "label": "Localities",
      "reference": {
        "path": "localities",
        "depth": 1
      },
      "items": [
        {
          "type": "object",
          "label": "First Locality",
          "reference": {
            "path": "localities[0]",
            "depth": 2
          },
          "children": [
            {
              "type": "field",
              "label": "Local Income Tax",
              "reference": {
                "path": "localities[0].localIncomeTax",
                "depth": 3
              },
              "value": {
                "original": "32401.39",
                "current": "32401.39"
              },
              "boundingBox": {
                "left": 0.7295751633986928,
                "top": 0.369949494949495,
                "width": 0.08006535947712423,
                "height": 0.008838383838383812,
                "page": 1
              },
              "subtype": "number",
              "confidence": {
                "level": "high"
              }
            },
            {
              "type": "field",
              "label": "Local Wages",
              "reference": {
                "path": "localities[0].localWages",
                "depth": 3
              },
              "value": {
                "original": "318229.98",
                "current": "318229.98"
              },
              "boundingBox": {
                "left": 0.5784313725490197,
                "top": 0.37058080808080807,
                "width": 0.08986928104575165,
                "height": 0.008838383838383812,
                "page": 1
              },
              "subtype": "number",
              "confidence": {
                "level": "high"
              }
            },
            {
              "type": "field",
              "label": "Locality Name",
              "reference": {
                "path": "localities[0].localityName",
                "depth": 3
              },
              "value": {
                "original": "Fisher Ridge",
                "current": "Fisher Ridge"
              },
              "boundingBox": {
                "left": 0.8684640522875817,
                "top": 0.37184343434343436,
                "width": 0.08986928104575154,
                "height": 0.008838383838383812,
                "page": 1
              },
              "subtype": "string",
              "confidence": {
                "level": "high"
              }
            }
          ]
        },
        {
          "type": "object",
          "label": "Second Locality",
          "reference": {
            "path": "localities[1]",
            "depth": 2
          },
          "children": [
            {
              "type": "field",
              "label": "Local Income Tax",
              "reference": {
                "path": "localities[1].localIncomeTax",
                "depth": 3
              },
              "value": {
                "original": "28277.73",
                "current": "28277.73"
              },
              "boundingBox": {
                "left": 0.7295751633986928,
                "top": 0.3970959595959596,
                "width": 0.08088235294117652,
                "height": 0.008207070707070718,
                "page": 1
              },
              "subtype": "number",
              "confidence": {
                "level": "high"
              }
            },
            {
              "type": "field",
              "label": "Local Wages",
              "reference": {
                "path": "localities[1].localWages",
                "depth": 3
              },
              "value": {
                "original": "284992.22",
                "current": "284992.22"
              },
              "boundingBox": {
                "left": 0.576797385620915,
                "top": 0.3970959595959596,
                "width": 0.09068627450980393,
                "height": 0.008207070707070718,
                "page": 1
              },
              "subtype": "number",
              "confidence": {
                "level": "high"
              }
            },
            {
              "type": "field",
              "label": "Locality Name",
              "reference": {
                "path": "localities[1].localityName",
                "depth": 3
              },
              "value": {
                "original": "Jefferson Ways",
                "current": "Jefferson Ways"
              },
              "boundingBox": {
                "left": 0.8700980392156863,
                "top": 0.3996212121212121,
                "width": 0.08823529411764708,
                "height": 0.00694444444444442,
                "page": 1
              },
              "subtype": "string",
              "confidence": {
                "level": "high"
              }
            }
          ]
        }
      ]
    },
    {
      "type": "field",
      "label": "Reissued Statement",
      "reference": {
        "path": "reissuedStatement",
        "depth": 1
      },
      "value": {
        "original": "True",
        "current": "True"
      },
      "boundingBox": {
        "left": 0.0727124183006536,
        "top": 0.054924242424242424,
        "width": 0.08251633986928104,
        "height": 0.022727272727272728,
        "page": 1
      },
      "subtype": "boolean",
      "confidence": {
        "level": "high"
      }
    },
    {
      "type": "list",
      "label": "States",
      "reference": {
        "path": "states",
        "depth": 1
      },
      "items": [
        {
          "type": "object",
          "label": "First State",
          "reference": {
            "path": "states[0]",
            "depth": 2
          },
          "children": [
            {
              "type": "field",
              "label": "Employer State Id",
              "reference": {
                "path": "states[0].employerStateId",
                "depth": 3
              },
              "value": {
                "original": "248-39-070",
                "current": "248-39-070"
              },
              "boundingBox": {
                "left": 0.13480392156862744,
                "top": 0.37058080808080807,
                "width": 0.10212418300653595,
                "height": 0.008207070707070718,
                "page": 1
              },
              "subtype": "string",
              "confidence": {
                "level": "high"
              }
            },
            {
              "type": "field",
              "label": "State",
              "reference": {
                "path": "states[0].state",
                "depth": 3
              },
              "value": {
                "original": "MD",
                "current": "MD"
              },
              "boundingBox": {
                "left": 0.04820261437908497,
                "top": 0.37184343434343436,
                "width": 0.022058823529411763,
                "height": 0.00694444444444442,
                "page": 1
              },
              "subtype": "string",
              "confidence": {
                "level": "high"
              }
            },
            {
              "type": "field",
              "label": "State Income Tax",
              "reference": {
                "path": "states[0].stateIncomeTax",
                "depth": 3
              },
              "value": {
                "original": "9799.81",
                "current": "9799.81"
              },
              "boundingBox": {
                "left": 0.4387254901960784,
                "top": 0.37058080808080807,
                "width": 0.06944444444444442,
                "height": 0.008207070707070718,
                "page": 1
              },
              "subtype": "number",
              "confidence": {
                "level": "high"
              }
            },
            {
              "type": "field",
              "label": "State Wages",
              "reference": {
                "path": "states[0].stateWages",
                "depth": 3
              },
              "value": {
                "original": "114593.63",
                "current": "114593.63"
              },
              "boundingBox": {
                "left": 0.2949346405228758,
                "top": 0.3693181818181818,
                "width": 0.08986928104575165,
                "height": 0.01010101010101011,
                "page": 1
              },
              "subtype": "number",
              "confidence": {
                "level": "high"
              }
            }
          ]
        },
        {
          "type": "object",
          "label": "Second State",
          "reference": {
            "path": "states[1]",
            "depth": 2
          },
          "children": [
            {
              "type": "field",
              "label": "Employer State Id",
              "reference": {
                "path": "states[1].employerStateId",
                "depth": 3
              },
              "value": {
                "original": "165-28-859",
                "current": "165-28-859"
              },
              "boundingBox": {
                "left": 0.13562091503267973,
                "top": 0.3958333333333333,
                "width": 0.10049019607843138,
                "height": 0.009469696969696961,
                "page": 1
              },
              "subtype": "string",
              "confidence": {
                "level": "high"
              }
            },
            {
              "type": "field",
              "label": "State",
              "reference": {
                "path": "states[1].state",
                "depth": 3
              },
              "value": {
                "original": "NE",
                "current": "NE"
              },
              "boundingBox": {
                "left": 0.04820261437908497,
                "top": 0.39835858585858586,
                "width": 0.021241830065359478,
                "height": 0.00694444444444442,
                "page": 1
              },
              "subtype": "string",
              "confidence": {
                "level": "high"
              }
            },
            {
              "type": "field",
              "label": "State Income Tax",
              "reference": {
                "path": "states[1].stateIncomeTax",
                "depth": 3
              },
              "value": {
                "original": "7086.1",
                "current": "7086.1"
              },
              "boundingBox": {
                "left": 0.43790849673202614,
                "top": 0.3970959595959596,
                "width": 0.059640522875817004,
                "height": 0.008207070707070718,
                "page": 1
              },
              "subtype": "number",
              "confidence": {
                "level": "high"
              }
            },
            {
              "type": "field",
              "label": "State Wages",
              "reference": {
                "path": "states[1].stateWages",
                "depth": 3
              },
              "value": {
                "original": "113115.7",
                "current": "113115.7"
              },
              "boundingBox": {
                "left": 0.29411764705882354,
                "top": 0.3970959595959596,
                "width": 0.08006535947712418,
                "height": 0.008838383838383812,
                "page": 1
              },
              "subtype": "number",
              "confidence": {
                "level": "high"
              }
            }
          ]
        }
      ]
    },
    {
      "type": "field",
      "label": "Tax Year",
      "reference": {
        "path": "taxYear",
        "depth": 1
      },
      "value": {
        "original": "2010",
        "current": "2010"
      },
      "boundingBox": {
        "left": 0.4444444444444444,
        "top": 0.4166666666666667,
        "width": 0.10457516339869277,
        "height": 0.021464646464646464,
        "page": 1
      },
      "subtype": "number",
      "confidence": {
        "level": "high"
      }
    }
  ],

  // K1
  "doc-004": [
    {
      "type": "object",
      "label": "Partner",
      "reference": {
        "path": "partner",
        "depth": 1
      },
      "children": [
        {
          "type": "field",
          "label": "Address",
          "reference": {
            "path": "partner.address",
            "depth": 2
          },
          "value": {
            "original": "Sara Randall\n488 Erin Knoll\nLake Corey, SD 60228",
            "current": "Sara Randall\n488 Erin Knoll\nLake Corey, SD 60228"
          },
          "boundingBox": {
            "left": 0.11601307189542484,
            "top": 0.24431818181818182,
            "width": 0.16666666666666666,
            "height": 0.03977272727272727,
            "page": 1
          },
          "subtype": "string",
          "confidence": {
            "level": "low"
          }
        },
        {
          "type": "field",
          "label": "Name",
          "reference": {
            "path": "partner.name",
            "depth": 2
          },
          "value": {
            "original": "Sara Randall\n488 Erin Knoll\nLake Corey, SD 60228",
            "current": "Sara Randall\n488 Erin Knoll\nLake Corey, SD 60228"
          },
          "boundingBox": {
            "left": 0.11601307189542484,
            "top": 0.24431818181818182,
            "width": 0.16666666666666666,
            "height": 0.03977272727272727,
            "page": 1
          },
          "subtype": "string",
          "confidence": {
            "level": "low"
          }
        },
        {
          "type": "object",
          "label": "Capital Account",
          "reference": {
            "path": "partner.capitalAccount",
            "depth": 2
          },
          "children": [
            {
              "type": "field",
              "label": "Withdrawals Distributions",
              "reference": {
                "path": "partner.capitalAccount.withdrawalsDistributions",
                "depth": 3
              },
              "value": {
                "original": "",
                "current": ""
              },
              "boundingBox": {
                "left": 0.5400326797385621,
                "top": 0.7279040404040404,
                "width": 0.1919934640522876,
                "height": 0.01452020202020202,
                "page": 2
              },
              "subtype": "string",
              "confidence": {
                "level": "low"
              }
            },
            {
              "type": "field",
              "label": "Current Year Income Loss",
              "reference": {
                "path": "partner.capitalAccount.currentYearIncomeLoss",
                "depth": 3
              },
              "value": {
                "original": "SCHEDULE K-1",
                "current": "SCHEDULE K-1"
              },
              "boundingBox": {
                "left": 0.30718954248366015,
                "top": 0.6483585858585859,
                "width": 0.45098039215686275,
                "height": 0.03156565656565657,
                "page": 3
              },
              "subtype": "string",
              "confidence": {
                "level": "low"
              }
            },
            {
              "type": "field",
              "label": "Beginning",
              "reference": {
                "path": "partner.capitalAccount.beginning",
                "depth": 3
              },
              "value": {
                "original": "12,571.",
                "current": "12,571."
              },
              "boundingBox": {
                "left": 0.8570261437908496,
                "top": 0.15214646464646464,
                "width": 0.0784313725490196,
                "height": 0.017045454545454544,
                "page": 18
              },
              "subtype": "number",
              "confidence": {
                "level": "low"
              }
            },
            {
              "type": "field",
              "label": "Ending",
              "reference": {
                "path": "partner.capitalAccount.ending",
                "depth": 3
              },
              "value": {
                "original": "11,819.",
                "current": "11,819."
              },
              "boundingBox": {
                "left": 0.8570261437908496,
                "top": 0.8042929292929293,
                "width": 0.0784313725490196,
                "height": 0.016414141414141416,
                "page": 18
              },
              "subtype": "number",
              "confidence": {
                "level": "low"
              }
            }
          ]
        },
        {
          "type": "object",
          "label": "Capital Pct",
          "reference": {
            "path": "partner.capitalPct",
            "depth": 2
          },
          "children": [
            {
              "type": "field",
              "label": "Begin",
              "reference": {
                "path": "partner.capitalPct.begin",
                "depth": 3
              },
              "value": {
                "original": "Capital 2.2661802% 2.3664267%",
                "current": "Capital 2.2661802% 2.3664267%"
              },
              "boundingBox": {
                "left": 0.06862745098039216,
                "top": 0.6212121212121212,
                "width": 0.4583333333333333,
                "height": 0.015151515151515152,
                "page": 2
              },
              "subtype": "string",
              "confidence": {
                "level": "low"
              }
            },
            {
              "type": "field",
              "label": "End",
              "reference": {
                "path": "partner.capitalPct.end",
                "depth": 3
              },
              "value": {
                "original": "ZZ * 3",
                "current": "ZZ * 3"
              },
              "boundingBox": {
                "left": 0.5400326797385621,
                "top": 0.6212121212121212,
                "width": 0.1919934640522876,
                "height": 0.015151515151515152,
                "page": 2
              },
              "subtype": "string",
              "confidence": {
                "level": "low"
              }
            }
          ]
        },
        {
          "type": "object",
          "label": "Loss Pct",
          "reference": {
            "path": "partner.lossPct",
            "depth": 2
          },
          "children": [
            {
              "type": "field",
              "label": "Begin",
              "reference": {
                "path": "partner.lossPct.begin",
                "depth": 3
              },
              "value": {
                "original": "Loss 2.3299171% 2.3195937%",
                "current": "Loss 2.3299171% 2.3195937%"
              },
              "boundingBox": {
                "left": 0.06862745098039216,
                "top": 0.6060606060606061,
                "width": 0.4583333333333333,
                "height": 0.015151515151515152,
                "page": 2
              },
              "subtype": "string",
              "confidence": {
                "level": "low"
              }
            },
            {
              "type": "field",
              "label": "End",
              "reference": {
                "path": "partner.lossPct.end",
                "depth": 3
              },
              "value": {
                "original": "11 Other income (loss)",
                "current": "11 Other income (loss)"
              },
              "boundingBox": {
                "left": 0.5400326797385621,
                "top": 0.6060606060606061,
                "width": 0.1919934640522876,
                "height": 0.015151515151515152,
                "page": 2
              },
              "subtype": "string",
              "confidence": {
                "level": "high"
              }
            }
          ]
        },
        {
          "type": "field",
          "label": "Partner Role",
          "reference": {
            "path": "partner.partnerRole",
            "depth": 2
          },
          "value": {
            "original": "LAKE COREY, SD 60228\nG General partner or LLC  Limited partner or other LLC",
            "current": "LAKE COREY, SD 60228\nG General partner or LLC  Limited partner or other LLC"
          },
          "boundingBox": {
            "left": 0.06862745098039216,
            "top": 0.4431818181818182,
            "width": 0.4583333333333333,
            "height": 0.011994949494949494,
            "page": 2
          },
          "subtype": "string",
          "confidence": {
            "level": "low"
          }
        },
        {
          "type": "object",
          "label": "Profit Pct",
          "reference": {
            "path": "partner.profitPct",
            "depth": 2
          },
          "children": [
            {
              "type": "field",
              "label": "Begin",
              "reference": {
                "path": "partner.profitPct.begin",
                "depth": 3
              },
              "value": {
                "original": "Profit 2.3299171% 2.3195937%",
                "current": "Profit 2.3299171% 2.3195937%"
              },
              "boundingBox": {
                "left": 0.06862745098039216,
                "top": 0.5909090909090909,
                "width": 0.4583333333333333,
                "height": 0.015151515151515152,
                "page": 2
              },
              "subtype": "string",
              "confidence": {
                "level": "low"
              }
            },
            {
              "type": "field",
              "label": "End",
              "reference": {
                "path": "partner.profitPct.end",
                "depth": 3
              },
              "value": {
                "original": "",
                "current": ""
              },
              "boundingBox": {
                "left": 0.5400326797385621,
                "top": 0.5909090909090909,
                "width": 0.1919934640522876,
                "height": 0.015151515151515152,
                "page": 2
              },
              "subtype": "string",
              "confidence": {
                "level": "high"
              }
            }
          ]
        },
        {
          "type": "field",
          "label": "Ssn Tin",
          "reference": {
            "path": "partner.ssnTin",
            "depth": 2
          },
          "value": {
            "original": "***-**-3222",
            "current": "***-**-3222"
          },
          "boundingBox": {
            "left": 0.8143939393939394,
            "top": 0.09967320261437909,
            "width": 0.08585858585858586,
            "height": 0.01470588235294118,
            "page": 10
          },
          "subtype": "string",
          "confidence": {
            "level": "high"
          }
        },
        {
          "type": "field",
          "label": "Type",
          "reference": {
            "path": "partner.type",
            "depth": 2
          },
          "value": {
            "original": "Individual",
            "current": "Individual"
          },
          "boundingBox": null,
          "subtype": "string",
          "confidence": {
            "level": null
          }
        }
      ]
    },
    {
      "type": "object",
      "label": "K1 Boxes",
      "reference": {
        "path": "k1Boxes",
        "depth": 1
      },
      "children": [
        {
          "type": "field",
          "label": "Distributions",
          "reference": {
            "path": "k1Boxes.distributions",
            "depth": 2
          },
          "value": {
            "original": "",
            "current": ""
          },
          "boundingBox": {
            "left": 0.5400326797385621,
            "top": 0.7279040404040404,
            "width": 0.1919934640522876,
            "height": 0.01452020202020202,
            "page": 2
          },
          "subtype": "string",
          "confidence": {
            "level": "low"
          }
        },
        {
          "type": "field",
          "label": "Foreign Taxes Paid",
          "reference": {
            "path": "k1Boxes.foreignTaxesPaid",
            "depth": 2
          },
          "value": {
            "original": "",
            "current": ""
          },
          "boundingBox": {
            "left": 0.5400326797385621,
            "top": 0.7279040404040404,
            "width": 0.1919934640522876,
            "height": 0.01452020202020202,
            "page": 2
          },
          "subtype": "string",
          "confidence": {
            "level": "low"
          }
        },
        {
          "type": "field",
          "label": "Interest Income",
          "reference": {
            "path": "k1Boxes.interestIncome",
            "depth": 2
          },
          "value": {
            "original": "",
            "current": ""
          },
          "boundingBox": {
            "left": 0.5400326797385621,
            "top": 0.7279040404040404,
            "width": 0.1919934640522876,
            "height": 0.01452020202020202,
            "page": 2
          },
          "subtype": "string",
          "confidence": {
            "level": "low"
          }
        },
        {
          "type": "field",
          "label": "Ordinary Business Income Loss",
          "reference": {
            "path": "k1Boxes.ordinaryBusinessIncomeLoss",
            "depth": 2
          },
          "value": {
            "original": "",
            "current": ""
          },
          "boundingBox": {
            "left": 0.7393790849673203,
            "top": 0.7279040404040404,
            "width": 0.19281045751633988,
            "height": 0.01452020202020202,
            "page": 2
          },
          "subtype": "string",
          "confidence": {
            "level": "low"
          }
        },
        {
          "type": "field",
          "label": "Self Employment Income Loss",
          "reference": {
            "path": "k1Boxes.selfEmploymentIncomeLoss",
            "depth": 2
          },
          "value": {
            "original": "",
            "current": ""
          },
          "boundingBox": {
            "left": 0.7393790849673203,
            "top": 0.7279040404040404,
            "width": 0.19281045751633988,
            "height": 0.01452020202020202,
            "page": 2
          },
          "subtype": "string",
          "confidence": {
            "level": "low"
          }
        },
        {
          "type": "object",
          "label": "Other Income",
          "reference": {
            "path": "k1Boxes.otherIncome",
            "depth": 2
          },
          "children": [
            {
              "type": "field",
              "label": "Staking Income",
              "reference": {
                "path": "k1Boxes.otherIncome.stakingIncome",
                "depth": 3
              },
              "value": {
                "original": "3.",
                "current": "3."
              },
              "boundingBox": {
                "left": 0.701797385620915,
                "top": 0.23674242424242425,
                "width": 0.11519607843137254,
                "height": 0.03851010101010101,
                "page": 13
              },
              "subtype": "number",
              "confidence": {
                "level": "low"
              }
            }
          ]
        },
        {
          "type": "object",
          "label": "Other Deductions",
          "reference": {
            "path": "k1Boxes.otherDeductions",
            "depth": 2
          },
          "children": [
            {
              "type": "field",
              "label": "Portfolio Deductions",
              "reference": {
                "path": "k1Boxes.otherDeductions.portfolioDeductions",
                "depth": 3
              },
              "value": {
                "original": "967.",
                "current": "967."
              },
              "boundingBox": {
                "left": 0.701797385620915,
                "top": 0.2563131313131313,
                "width": 0.11519607843137254,
                "height": 0.02335858585858586,
                "page": 16
              },
              "subtype": "number",
              "confidence": {
                "level": "low"
              }
            }
          ]
        },
        {
          "type": "field",
          "label": "Net Long Term Capital Gain",
          "reference": {
            "path": "k1Boxes.netLongTermCapitalGain",
            "depth": 2
          },
          "value": {
            "original": "$ 212.",
            "current": "$ 212."
          },
          "boundingBox": {
            "left": 0.7573529411764706,
            "top": 0.27335858585858586,
            "width": 0.17892156862745098,
            "height": 0.015151515151515152,
            "page": 17
          },
          "subtype": "string",
          "confidence": {
            "level": "high"
          }
        },
        {
          "type": "field",
          "label": "Tax Exempt Income",
          "reference": {
            "path": "k1Boxes.taxExemptIncome",
            "depth": 2
          },
          "value": {
            "original": "0.",
            "current": "0."
          },
          "boundingBox": {
            "left": 0.8570261437908496,
            "top": 0.9406565656565656,
            "width": 0.0784313725490196,
            "height": 0.01893939393939394,
            "page": 18
          },
          "subtype": "number",
          "confidence": {
            "level": "low"
          }
        },
        {
          "type": "object",
          "label": "Other Information",
          "reference": {
            "path": "k1Boxes.otherInformation",
            "depth": 2
          },
          "children": []
        }
      ]
    },
    {
      "type": "object",
      "label": "Partnership",
      "reference": {
        "path": "partnership",
        "depth": 1
      },
      "children": [
        {
          "type": "field",
          "label": "Ein",
          "reference": {
            "path": "partnership.ein",
            "depth": 2
          },
          "value": {
            "original": "82-4974819",
            "current": "82-4974819"
          },
          "boundingBox": {
            "left": 0.8300653594771242,
            "top": 0.036616161616161616,
            "width": 0.11192810457516345,
            "height": 0.009469696969696968,
            "page": 3
          },
          "subtype": "string",
          "confidence": {
            "level": "high"
          }
        },
        {
          "type": "field",
          "label": "Name",
          "reference": {
            "path": "partnership.name",
            "depth": 2
          },
          "value": {
            "original": "SWICK CAPITAL FUND LP",
            "current": "SWICK CAPITAL FUND LP"
          },
          "boundingBox": {
            "left": 0.049836601307189546,
            "top": 0.037247474747474744,
            "width": 0.23856209150326801,
            "height": 0.009469696969696968,
            "page": 3
          },
          "subtype": "string",
          "confidence": {
            "level": "high"
          }
        },
        {
          "type": "field",
          "label": "Address",
          "reference": {
            "path": "partnership.address",
            "depth": 2
          },
          "value": {
            "original": "5101 MIRROR LAKES DRIVE",
            "current": "5101 MIRROR LAKES DRIVE"
          },
          "boundingBox": {
            "left": 0.05800653594771242,
            "top": 0.24179292929292928,
            "width": 0.41911764705882354,
            "height": 0.016414141414141416,
            "page": 9
          },
          "subtype": "string",
          "confidence": {
            "level": "low"
          }
        }
      ]
    },
    {
      "type": "object",
      "label": "Footnotes",
      "reference": {
        "path": "footnotes",
        "depth": 1
      },
      "children": [
        {
          "type": "field",
          "label": "Portfolio Income Treatment",
          "reference": {
            "path": "footnotes.portfolioIncomeTreatment",
            "depth": 2
          },
          "value": {
            "original": "True",
            "current": "True"
          },
          "boundingBox": {
            "left": 0.04820261437908497,
            "top": 0.3768939393939394,
            "width": 0.4027777777777778,
            "height": 0.010732323232323232,
            "page": 4
          },
          "subtype": "boolean",
          "confidence": {
            "level": "high"
          }
        },
        {
          "type": "field",
          "label": "Subject To Niit",
          "reference": {
            "path": "footnotes.subjectToNiit",
            "depth": 2
          },
          "value": {
            "original": "True",
            "current": "True"
          },
          "boundingBox": {
            "left": 0.15196078431372548,
            "top": 0.740530303030303,
            "width": 0.24019607843137256,
            "height": 0.010732323232323232,
            "page": 4
          },
          "subtype": "boolean",
          "confidence": {
            "level": "high"
          }
        },
        {
          "type": "field",
          "label": "Ubti Generated",
          "reference": {
            "path": "footnotes.ubtiGenerated",
            "depth": 2
          },
          "value": {
            "original": "False",
            "current": "False"
          },
          "boundingBox": {
            "left": 0.049019607843137254,
            "top": 0.8333333333333334,
            "width": 0.6527777777777778,
            "height": 0.029671717171717172,
            "page": 4
          },
          "subtype": "boolean",
          "confidence": {
            "level": "high"
          }
        }
      ]
    },
    {
      "type": "object",
      "label": "Schedule K3",
      "reference": {
        "path": "scheduleK3",
        "depth": 1
      },
      "children": [
        {
          "type": "object",
          "label": "Foreign Income",
          "reference": {
            "path": "scheduleK3.foreignIncome",
            "depth": 2
          },
          "children": [
            {
              "type": "field",
              "label": "Long Term Capital Gain",
              "reference": {
                "path": "scheduleK3.foreignIncome.longTermCapitalGain",
                "depth": 3
              },
              "value": {
                "original": "212.",
                "current": "212."
              },
              "boundingBox": {
                "left": 0.821969696969697,
                "top": 0.46977124183006536,
                "width": 0.03156565656565657,
                "height": 0.0392156862745098,
                "page": 11
              },
              "subtype": "number",
              "confidence": {
                "level": "low"
              }
            },
            {
              "type": "field",
              "label": "Other Income Staking",
              "reference": {
                "path": "scheduleK3.foreignIncome.otherIncomeStaking",
                "depth": 3
              },
              "value": {
                "original": "3.",
                "current": "3."
              },
              "boundingBox": {
                "left": 0.8513071895424836,
                "top": 0.23674242424242425,
                "width": 0.0857843137254902,
                "height": 0.03851010101010101,
                "page": 13
              },
              "subtype": "number",
              "confidence": {
                "level": "low"
              }
            }
          ]
        },
        {
          "type": "object",
          "label": "Deductions",
          "reference": {
            "path": "scheduleK3.deductions",
            "depth": 2
          },
          "children": [
            {
              "type": "field",
              "label": "Portfolio Deductions",
              "reference": {
                "path": "scheduleK3.deductions.portfolioDeductions",
                "depth": 3
              },
              "value": {
                "original": "967.",
                "current": "967."
              },
              "boundingBox": {
                "left": 0.8513071895424836,
                "top": 0.2563131313131313,
                "width": 0.08823529411764706,
                "height": 0.02335858585858586,
                "page": 16
              },
              "subtype": "number",
              "confidence": {
                "level": "low"
              }
            }
          ]
        }
      ]
    }
  ],

  // 1099-Composite: Schwab
  "doc-002": [
    {
      "type": "object",
      "label": "Recipient",
      "reference": {
        "path": "recipient",
        "depth": 1
      },
      "children": [
        {
          "type": "field",
          "label": "Name",
          "reference": {
            "path": "recipient.name",
            "depth": 2
          },
          "value": {
            "original": "Recipient's Name and Address",
            "current": "Recipient's Name and Address"
          },
          "boundingBox": {
            "left": 0.036616161616161616,
            "top": 0.2173202614379085,
            "width": 0.2013888888888889,
            "height": 0.01715686274509804,
            "page": 1
          },
          "subtype": "string",
          "confidence": {
            "level": "high"
          }
        },
        {
          "type": "field",
          "label": "Account Number",
          "reference": {
            "path": "recipient.account_number",
            "depth": 2
          },
          "value": {
            "original": "5284-8215",
            "current": "5284-8215"
          },
          "boundingBox": {
            "left": 0.3939393939393939,
            "top": 0.28104575163398693,
            "width": 0.05366161616161613,
            "height": 0.010620915032679756,
            "page": 3
          },
          "subtype": "string",
          "confidence": {
            "level": "high"
          }
        },
        {
          "type": "field",
          "label": "Address",
          "reference": {
            "path": "recipient.address",
            "depth": 2
          },
          "value": {
            "original": "SARA RANDALL\n488 ERN KNOLL\nLAKE COREY, SD 60228-2982",
            "current": "SARA RANDALL\n488 ERN KNOLL\nLAKE COREY, SD 60228-2982"
          },
          "boundingBox": {
            "left": 0.04419191919191919,
            "top": 0.21568627450980393,
            "width": 0.16792929292929293,
            "height": 0.049836601307189546,
            "page": 3
          },
          "subtype": "string",
          "confidence": {
            "level": "high"
          }
        },
        {
          "type": "field",
          "label": "Taxpayer Id",
          "reference": {
            "path": "recipient.taxpayer_id",
            "depth": 2
          },
          "value": {
            "original": "***-**-3222",
            "current": "***-**-3222"
          },
          "boundingBox": {
            "left": 0.16351010101010102,
            "top": 0.2785947712418301,
            "width": 0.05492424242424243,
            "height": 0.013888888888888895,
            "page": 3
          },
          "subtype": "string",
          "confidence": {
            "level": "high"
          }
        }
      ]
    },
    {
      "type": "object",
      "label": "Forms",
      "reference": {
        "path": "forms",
        "depth": 1
      },
      "children": [
        {
          "type": "object",
          "label": "1099-Misc",
          "reference": {
            "path": "forms.1099-MISC",
            "depth": 2
          },
          "children": [
            {
              "type": "field",
              "label": "10 Gross Proceeds To Attorney",
              "reference": {
                "path": "forms.1099-MISC.10_gross_proceeds_to_attorney",
                "depth": 3
              },
              "value": {
                "original": "Your Form 1099 Composite may include the following Internal Revenue Service (IRS) forms: 1099-DIV, 1099-INT, 1099-MISC, 1099-B and 1099-OID. You'll only receive the form(s) that apply to your particular financial situation and please keep for your records. Please note that information in the Year-End Summary is not provided to the IRS. It is provided to you as additional tax reporting information you may need to complete your tax return.",
                "current": "Your Form 1099 Composite may include the following Internal Revenue Service (IRS) forms: 1099-DIV, 1099-INT, 1099-MISC, 1099-B and 1099-OID. You'll only receive the form(s) that apply to your particular financial situation and please keep for your records. Please note that information in the Year-End Summary is not provided to the IRS. It is provided to you as additional tax reporting information you may need to complete your tax return."
              },
              "boundingBox": {
                "left": 0.04482323232323232,
                "top": 0.190359477124183,
                "width": 0.8705808080808081,
                "height": 0.042483660130718956,
                "page": 2
              },
              "subtype": "string",
              "confidence": {
                "level": "high"
              }
            },
            {
              "type": "field",
              "label": "12 Section409 A Income",
              "reference": {
                "path": "forms.1099-MISC.12_section409A_income",
                "depth": 3
              },
              "value": {
                "original": "Your Form 1099 Composite may include the following Internal Revenue Service (IRS) forms: 1099-DIV, 1099-INT, 1099-MISC, 1099-B and 1099-OID. You'll only receive the form(s) that apply to your particular financial situation and please keep for your records. Please note that information in the Year-End Summary is not provided to the IRS. It is provided to you as additional tax reporting information you may need to complete your tax return.",
                "current": "Your Form 1099 Composite may include the following Internal Revenue Service (IRS) forms: 1099-DIV, 1099-INT, 1099-MISC, 1099-B and 1099-OID. You'll only receive the form(s) that apply to your particular financial situation and please keep for your records. Please note that information in the Year-End Summary is not provided to the IRS. It is provided to you as additional tax reporting information you may need to complete your tax return."
              },
              "boundingBox": {
                "left": 0.04482323232323232,
                "top": 0.190359477124183,
                "width": 0.8705808080808081,
                "height": 0.042483660130718956,
                "page": 2
              },
              "subtype": "string",
              "confidence": {
                "level": "high"
              }
            },
            {
              "type": "field",
              "label": "14 Nonqualified Deferred Comp",
              "reference": {
                "path": "forms.1099-MISC.14_nonqualified_deferred_comp",
                "depth": 3
              },
              "value": {
                "original": "Your Form 1099 Composite may include the following Internal Revenue Service (IRS) forms: 1099-DIV, 1099-INT, 1099-MISC, 1099-B and 1099-OID. You'll only receive the form(s) that apply to your particular financial situation and please keep for your records. Please note that information in the Year-End Summary is not provided to the IRS. It is provided to you as additional tax reporting information you may need to complete your tax return.",
                "current": "Your Form 1099 Composite may include the following Internal Revenue Service (IRS) forms: 1099-DIV, 1099-INT, 1099-MISC, 1099-B and 1099-OID. You'll only receive the form(s) that apply to your particular financial situation and please keep for your records. Please note that information in the Year-End Summary is not provided to the IRS. It is provided to you as additional tax reporting information you may need to complete your tax return."
              },
              "boundingBox": {
                "left": 0.04482323232323232,
                "top": 0.190359477124183,
                "width": 0.8705808080808081,
                "height": 0.042483660130718956,
                "page": 2
              },
              "subtype": "string",
              "confidence": {
                "level": "high"
              }
            },
            {
              "type": "field",
              "label": "15 State",
              "reference": {
                "path": "forms.1099-MISC.15_state",
                "depth": 3
              },
              "value": {
                "original": "Your Form 1099 Composite may include the following Internal Revenue Service (IRS) forms: 1099-DIV, 1099-INT, 1099-MISC, 1099-B and 1099-OID. You'll only receive the form(s) that apply to your particular financial situation and please keep for your records. Please note that information in the Year-End Summary is not provided to the IRS. It is provided to you as additional tax reporting information you may need to complete your tax return.",
                "current": "Your Form 1099 Composite may include the following Internal Revenue Service (IRS) forms: 1099-DIV, 1099-INT, 1099-MISC, 1099-B and 1099-OID. You'll only receive the form(s) that apply to your particular financial situation and please keep for your records. Please note that information in the Year-End Summary is not provided to the IRS. It is provided to you as additional tax reporting information you may need to complete your tax return."
              },
              "boundingBox": {
                "left": 0.04482323232323232,
                "top": 0.190359477124183,
                "width": 0.8705808080808081,
                "height": 0.042483660130718956,
                "page": 2
              },
              "subtype": "string",
              "confidence": {
                "level": "high"
              }
            },
            {
              "type": "field",
              "label": "16 State Id Number",
              "reference": {
                "path": "forms.1099-MISC.16_state_id_number",
                "depth": 3
              },
              "value": {
                "original": "Your Form 1099 Composite may include the following Internal Revenue Service (IRS) forms: 1099-DIV, 1099-INT, 1099-MISC, 1099-B and 1099-OID. You'll only receive the form(s) that apply to your particular financial situation and please keep for your records. Please note that information in the Year-End Summary is not provided to the IRS. It is provided to you as additional tax reporting information you may need to complete your tax return.",
                "current": "Your Form 1099 Composite may include the following Internal Revenue Service (IRS) forms: 1099-DIV, 1099-INT, 1099-MISC, 1099-B and 1099-OID. You'll only receive the form(s) that apply to your particular financial situation and please keep for your records. Please note that information in the Year-End Summary is not provided to the IRS. It is provided to you as additional tax reporting information you may need to complete your tax return."
              },
              "boundingBox": {
                "left": 0.04482323232323232,
                "top": 0.190359477124183,
                "width": 0.8705808080808081,
                "height": 0.042483660130718956,
                "page": 2
              },
              "subtype": "string",
              "confidence": {
                "level": "high"
              }
            },
            {
              "type": "field",
              "label": "17 State Tax Withheld",
              "reference": {
                "path": "forms.1099-MISC.17_state_tax_withheld",
                "depth": 3
              },
              "value": {
                "original": "Your Form 1099 Composite may include the following Internal Revenue Service (IRS) forms: 1099-DIV, 1099-INT, 1099-MISC, 1099-B and 1099-OID. You'll only receive the form(s) that apply to your particular financial situation and please keep for your records. Please note that information in the Year-End Summary is not provided to the IRS. It is provided to you as additional tax reporting information you may need to complete your tax return.",
                "current": "Your Form 1099 Composite may include the following Internal Revenue Service (IRS) forms: 1099-DIV, 1099-INT, 1099-MISC, 1099-B and 1099-OID. You'll only receive the form(s) that apply to your particular financial situation and please keep for your records. Please note that information in the Year-End Summary is not provided to the IRS. It is provided to you as additional tax reporting information you may need to complete your tax return."
              },
              "boundingBox": {
                "left": 0.04482323232323232,
                "top": 0.190359477124183,
                "width": 0.8705808080808081,
                "height": 0.042483660130718956,
                "page": 2
              },
              "subtype": "string",
              "confidence": {
                "level": "high"
              }
            },
            {
              "type": "field",
              "label": "1 Rents",
              "reference": {
                "path": "forms.1099-MISC.1_rents",
                "depth": 3
              },
              "value": {
                "original": "Your Form 1099 Composite may include the following Internal Revenue Service (IRS) forms: 1099-DIV, 1099-INT, 1099-MISC, 1099-B and 1099-OID. You'll only receive the form(s) that apply to your particular financial situation and please keep for your records. Please note that information in the Year-End Summary is not provided to the IRS. It is provided to you as additional tax reporting information you may need to complete your tax return.",
                "current": "Your Form 1099 Composite may include the following Internal Revenue Service (IRS) forms: 1099-DIV, 1099-INT, 1099-MISC, 1099-B and 1099-OID. You'll only receive the form(s) that apply to your particular financial situation and please keep for your records. Please note that information in the Year-End Summary is not provided to the IRS. It is provided to you as additional tax reporting information you may need to complete your tax return."
              },
              "boundingBox": {
                "left": 0.04482323232323232,
                "top": 0.190359477124183,
                "width": 0.8705808080808081,
                "height": 0.042483660130718956,
                "page": 2
              },
              "subtype": "string",
              "confidence": {
                "level": "high"
              }
            },
            {
              "type": "field",
              "label": "2 Royalties",
              "reference": {
                "path": "forms.1099-MISC.2_royalties",
                "depth": 3
              },
              "value": {
                "original": "Your Form 1099 Composite may include the following Internal Revenue Service (IRS) forms: 1099-DIV, 1099-INT, 1099-MISC, 1099-B and 1099-OID. You'll only receive the form(s) that apply to your particular financial situation and please keep for your records. Please note that information in the Year-End Summary is not provided to the IRS. It is provided to you as additional tax reporting information you may need to complete your tax return.",
                "current": "Your Form 1099 Composite may include the following Internal Revenue Service (IRS) forms: 1099-DIV, 1099-INT, 1099-MISC, 1099-B and 1099-OID. You'll only receive the form(s) that apply to your particular financial situation and please keep for your records. Please note that information in the Year-End Summary is not provided to the IRS. It is provided to you as additional tax reporting information you may need to complete your tax return."
              },
              "boundingBox": {
                "left": 0.04482323232323232,
                "top": 0.190359477124183,
                "width": 0.8705808080808081,
                "height": 0.042483660130718956,
                "page": 2
              },
              "subtype": "string",
              "confidence": {
                "level": "high"
              }
            },
            {
              "type": "field",
              "label": "3 Other Income",
              "reference": {
                "path": "forms.1099-MISC.3_other_income",
                "depth": 3
              },
              "value": {
                "original": "Your Form 1099 Composite may include the following Internal Revenue Service (IRS) forms: 1099-DIV, 1099-INT, 1099-MISC, 1099-B and 1099-OID. You'll only receive the form(s) that apply to your particular financial situation and please keep for your records. Please note that information in the Year-End Summary is not provided to the IRS. It is provided to you as additional tax reporting information you may need to complete your tax return.",
                "current": "Your Form 1099 Composite may include the following Internal Revenue Service (IRS) forms: 1099-DIV, 1099-INT, 1099-MISC, 1099-B and 1099-OID. You'll only receive the form(s) that apply to your particular financial situation and please keep for your records. Please note that information in the Year-End Summary is not provided to the IRS. It is provided to you as additional tax reporting information you may need to complete your tax return."
              },
              "boundingBox": {
                "left": 0.04482323232323232,
                "top": 0.190359477124183,
                "width": 0.8705808080808081,
                "height": 0.042483660130718956,
                "page": 2
              },
              "subtype": "string",
              "confidence": {
                "level": "high"
              }
            },
            {
              "type": "field",
              "label": "4 Federal Income Tax Withheld",
              "reference": {
                "path": "forms.1099-MISC.4_federal_income_tax_withheld",
                "depth": 3
              },
              "value": {
                "original": "Your Form 1099 Composite may include the following Internal Revenue Service (IRS) forms: 1099-DIV, 1099-INT, 1099-MISC, 1099-B and 1099-OID. You'll only receive the form(s) that apply to your particular financial situation and please keep for your records. Please note that information in the Year-End Summary is not provided to the IRS. It is provided to you as additional tax reporting information you may need to complete your tax return.",
                "current": "Your Form 1099 Composite may include the following Internal Revenue Service (IRS) forms: 1099-DIV, 1099-INT, 1099-MISC, 1099-B and 1099-OID. You'll only receive the form(s) that apply to your particular financial situation and please keep for your records. Please note that information in the Year-End Summary is not provided to the IRS. It is provided to you as additional tax reporting information you may need to complete your tax return."
              },
              "boundingBox": {
                "left": 0.04482323232323232,
                "top": 0.190359477124183,
                "width": 0.8705808080808081,
                "height": 0.042483660130718956,
                "page": 2
              },
              "subtype": "string",
              "confidence": {
                "level": "high"
              }
            },
            {
              "type": "field",
              "label": "5 Fishing Boat Proceeds",
              "reference": {
                "path": "forms.1099-MISC.5_fishing_boat_proceeds",
                "depth": 3
              },
              "value": {
                "original": "Your Form 1099 Composite may include the following Internal Revenue Service (IRS) forms: 1099-DIV, 1099-INT, 1099-MISC, 1099-B and 1099-OID. You'll only receive the form(s) that apply to your particular financial situation and please keep for your records. Please note that information in the Year-End Summary is not provided to the IRS. It is provided to you as additional tax reporting information you may need to complete your tax return.",
                "current": "Your Form 1099 Composite may include the following Internal Revenue Service (IRS) forms: 1099-DIV, 1099-INT, 1099-MISC, 1099-B and 1099-OID. You'll only receive the form(s) that apply to your particular financial situation and please keep for your records. Please note that information in the Year-End Summary is not provided to the IRS. It is provided to you as additional tax reporting information you may need to complete your tax return."
              },
              "boundingBox": {
                "left": 0.04482323232323232,
                "top": 0.190359477124183,
                "width": 0.8705808080808081,
                "height": 0.042483660130718956,
                "page": 2
              },
              "subtype": "string",
              "confidence": {
                "level": "high"
              }
            },
            {
              "type": "field",
              "label": "6 Medical And Healthcare Payments",
              "reference": {
                "path": "forms.1099-MISC.6_medical_and_healthcare_payments",
                "depth": 3
              },
              "value": {
                "original": "Your Form 1099 Composite may include the following Internal Revenue Service (IRS) forms: 1099-DIV, 1099-INT, 1099-MISC, 1099-B and 1099-OID. You'll only receive the form(s) that apply to your particular financial situation and please keep for your records. Please note that information in the Year-End Summary is not provided to the IRS. It is provided to you as additional tax reporting information you may need to complete your tax return.",
                "current": "Your Form 1099 Composite may include the following Internal Revenue Service (IRS) forms: 1099-DIV, 1099-INT, 1099-MISC, 1099-B and 1099-OID. You'll only receive the form(s) that apply to your particular financial situation and please keep for your records. Please note that information in the Year-End Summary is not provided to the IRS. It is provided to you as additional tax reporting information you may need to complete your tax return."
              },
              "boundingBox": {
                "left": 0.04482323232323232,
                "top": 0.190359477124183,
                "width": 0.8705808080808081,
                "height": 0.042483660130718956,
                "page": 2
              },
              "subtype": "string",
              "confidence": {
                "level": "high"
              }
            },
            {
              "type": "field",
              "label": "7 Nonemployee Compensation",
              "reference": {
                "path": "forms.1099-MISC.7_nonemployee_compensation",
                "depth": 3
              },
              "value": {
                "original": "Your Form 1099 Composite may include the following Internal Revenue Service (IRS) forms: 1099-DIV, 1099-INT, 1099-MISC, 1099-B and 1099-OID. You'll only receive the form(s) that apply to your particular financial situation and please keep for your records. Please note that information in the Year-End Summary is not provided to the IRS. It is provided to you as additional tax reporting information you may need to complete your tax return.",
                "current": "Your Form 1099 Composite may include the following Internal Revenue Service (IRS) forms: 1099-DIV, 1099-INT, 1099-MISC, 1099-B and 1099-OID. You'll only receive the form(s) that apply to your particular financial situation and please keep for your records. Please note that information in the Year-End Summary is not provided to the IRS. It is provided to you as additional tax reporting information you may need to complete your tax return."
              },
              "boundingBox": {
                "left": 0.04482323232323232,
                "top": 0.190359477124183,
                "width": 0.8705808080808081,
                "height": 0.042483660130718956,
                "page": 2
              },
              "subtype": "string",
              "confidence": {
                "level": "high"
              }
            },
            {
              "type": "field",
              "label": "8 Substitute Payments In Lieu",
              "reference": {
                "path": "forms.1099-MISC.8_substitute_payments_in_lieu",
                "depth": 3
              },
              "value": {
                "original": "Your Form 1099 Composite may include the following Internal Revenue Service (IRS) forms: 1099-DIV, 1099-INT, 1099-MISC, 1099-B and 1099-OID. You'll only receive the form(s) that apply to your particular financial situation and please keep for your records. Please note that information in the Year-End Summary is not provided to the IRS. It is provided to you as additional tax reporting information you may need to complete your tax return.",
                "current": "Your Form 1099 Composite may include the following Internal Revenue Service (IRS) forms: 1099-DIV, 1099-INT, 1099-MISC, 1099-B and 1099-OID. You'll only receive the form(s) that apply to your particular financial situation and please keep for your records. Please note that information in the Year-End Summary is not provided to the IRS. It is provided to you as additional tax reporting information you may need to complete your tax return."
              },
              "boundingBox": {
                "left": 0.04482323232323232,
                "top": 0.190359477124183,
                "width": 0.8705808080808081,
                "height": 0.042483660130718956,
                "page": 2
              },
              "subtype": "string",
              "confidence": {
                "level": "high"
              }
            },
            {
              "type": "field",
              "label": "9 Crop Insurance Proceeds",
              "reference": {
                "path": "forms.1099-MISC.9_crop_insurance_proceeds",
                "depth": 3
              },
              "value": {
                "original": "Your Form 1099 Composite may include the following Internal Revenue Service (IRS) forms: 1099-DIV, 1099-INT, 1099-MISC, 1099-B and 1099-OID. You'll only receive the form(s) that apply to your particular financial situation and please keep for your records. Please note that information in the Year-End Summary is not provided to the IRS. It is provided to you as additional tax reporting information you may need to complete your tax return.",
                "current": "Your Form 1099 Composite may include the following Internal Revenue Service (IRS) forms: 1099-DIV, 1099-INT, 1099-MISC, 1099-B and 1099-OID. You'll only receive the form(s) that apply to your particular financial situation and please keep for your records. Please note that information in the Year-End Summary is not provided to the IRS. It is provided to you as additional tax reporting information you may need to complete your tax return."
              },
              "boundingBox": {
                "left": 0.04482323232323232,
                "top": 0.190359477124183,
                "width": 0.8705808080808081,
                "height": 0.042483660130718956,
                "page": 2
              },
              "subtype": "string",
              "confidence": {
                "level": "high"
              }
            }
          ]
        },
        {
          "type": "object",
          "label": "1099-Oid",
          "reference": {
            "path": "forms.1099-OID",
            "depth": 2
          },
          "children": [
            {
              "type": "field",
              "label": "10 Bond Premium",
              "reference": {
                "path": "forms.1099-OID.10_bond_premium",
                "depth": 3
              },
              "value": {
                "original": "Your Form 1099 Composite may include the following Internal Revenue Service (IRS) forms: 1099-DIV, 1099-INT, 1099-MISC, 1099-B and 1099-OID. You'll only receive the form(s) that apply to your particular financial situation and please keep for your records. Please note that information in the Year-End Summary is not provided to the IRS. It is provided to you as additional tax reporting information you may need to complete your tax return.",
                "current": "Your Form 1099 Composite may include the following Internal Revenue Service (IRS) forms: 1099-DIV, 1099-INT, 1099-MISC, 1099-B and 1099-OID. You'll only receive the form(s) that apply to your particular financial situation and please keep for your records. Please note that information in the Year-End Summary is not provided to the IRS. It is provided to you as additional tax reporting information you may need to complete your tax return."
              },
              "boundingBox": {
                "left": 0.04482323232323232,
                "top": 0.190359477124183,
                "width": 0.8705808080808081,
                "height": 0.042483660130718956,
                "page": 2
              },
              "subtype": "string",
              "confidence": {
                "level": "high"
              }
            },
            {
              "type": "field",
              "label": "11 Tax Exempt Oid",
              "reference": {
                "path": "forms.1099-OID.11_tax_exempt_oid",
                "depth": 3
              },
              "value": {
                "original": "Your Form 1099 Composite may include the following Internal Revenue Service (IRS) forms: 1099-DIV, 1099-INT, 1099-MISC, 1099-B and 1099-OID. You'll only receive the form(s) that apply to your particular financial situation and please keep for your records. Please note that information in the Year-End Summary is not provided to the IRS. It is provided to you as additional tax reporting information you may need to complete your tax return.",
                "current": "Your Form 1099 Composite may include the following Internal Revenue Service (IRS) forms: 1099-DIV, 1099-INT, 1099-MISC, 1099-B and 1099-OID. You'll only receive the form(s) that apply to your particular financial situation and please keep for your records. Please note that information in the Year-End Summary is not provided to the IRS. It is provided to you as additional tax reporting information you may need to complete your tax return."
              },
              "boundingBox": {
                "left": 0.04482323232323232,
                "top": 0.190359477124183,
                "width": 0.8705808080808081,
                "height": 0.042483660130718956,
                "page": 2
              },
              "subtype": "string",
              "confidence": {
                "level": "high"
              }
            },
            {
              "type": "field",
              "label": "12 State",
              "reference": {
                "path": "forms.1099-OID.12_state",
                "depth": 3
              },
              "value": {
                "original": "Your Form 1099 Composite may include the following Internal Revenue Service (IRS) forms: 1099-DIV, 1099-INT, 1099-MISC, 1099-B and 1099-OID. You'll only receive the form(s) that apply to your particular financial situation and please keep for your records. Please note that information in the Year-End Summary is not provided to the IRS. It is provided to you as additional tax reporting information you may need to complete your tax return.",
                "current": "Your Form 1099 Composite may include the following Internal Revenue Service (IRS) forms: 1099-DIV, 1099-INT, 1099-MISC, 1099-B and 1099-OID. You'll only receive the form(s) that apply to your particular financial situation and please keep for your records. Please note that information in the Year-End Summary is not provided to the IRS. It is provided to you as additional tax reporting information you may need to complete your tax return."
              },
              "boundingBox": {
                "left": 0.04482323232323232,
                "top": 0.190359477124183,
                "width": 0.8705808080808081,
                "height": 0.042483660130718956,
                "page": 2
              },
              "subtype": "string",
              "confidence": {
                "level": "high"
              }
            },
            {
              "type": "field",
              "label": "13 State Id Number",
              "reference": {
                "path": "forms.1099-OID.13_state_id_number",
                "depth": 3
              },
              "value": {
                "original": "Your Form 1099 Composite may include the following Internal Revenue Service (IRS) forms: 1099-DIV, 1099-INT, 1099-MISC, 1099-B and 1099-OID. You'll only receive the form(s) that apply to your particular financial situation and please keep for your records. Please note that information in the Year-End Summary is not provided to the IRS. It is provided to you as additional tax reporting information you may need to complete your tax return.",
                "current": "Your Form 1099 Composite may include the following Internal Revenue Service (IRS) forms: 1099-DIV, 1099-INT, 1099-MISC, 1099-B and 1099-OID. You'll only receive the form(s) that apply to your particular financial situation and please keep for your records. Please note that information in the Year-End Summary is not provided to the IRS. It is provided to you as additional tax reporting information you may need to complete your tax return."
              },
              "boundingBox": {
                "left": 0.04482323232323232,
                "top": 0.190359477124183,
                "width": 0.8705808080808081,
                "height": 0.042483660130718956,
                "page": 2
              },
              "subtype": "string",
              "confidence": {
                "level": "high"
              }
            },
            {
              "type": "field",
              "label": "14 State Tax Withheld",
              "reference": {
                "path": "forms.1099-OID.14_state_tax_withheld",
                "depth": 3
              },
              "value": {
                "original": "Your Form 1099 Composite may include the following Internal Revenue Service (IRS) forms: 1099-DIV, 1099-INT, 1099-MISC, 1099-B and 1099-OID. You'll only receive the form(s) that apply to your particular financial situation and please keep for your records. Please note that information in the Year-End Summary is not provided to the IRS. It is provided to you as additional tax reporting information you may need to complete your tax return.",
                "current": "Your Form 1099 Composite may include the following Internal Revenue Service (IRS) forms: 1099-DIV, 1099-INT, 1099-MISC, 1099-B and 1099-OID. You'll only receive the form(s) that apply to your particular financial situation and please keep for your records. Please note that information in the Year-End Summary is not provided to the IRS. It is provided to you as additional tax reporting information you may need to complete your tax return."
              },
              "boundingBox": {
                "left": 0.04482323232323232,
                "top": 0.190359477124183,
                "width": 0.8705808080808081,
                "height": 0.042483660130718956,
                "page": 2
              },
              "subtype": "string",
              "confidence": {
                "level": "high"
              }
            },
            {
              "type": "field",
              "label": "1 Original Issue Discount",
              "reference": {
                "path": "forms.1099-OID.1_original_issue_discount",
                "depth": 3
              },
              "value": {
                "original": "Your Form 1099 Composite may include the following Internal Revenue Service (IRS) forms: 1099-DIV, 1099-INT, 1099-MISC, 1099-B and 1099-OID. You'll only receive the form(s) that apply to your particular financial situation and please keep for your records. Please note that information in the Year-End Summary is not provided to the IRS. It is provided to you as additional tax reporting information you may need to complete your tax return.",
                "current": "Your Form 1099 Composite may include the following Internal Revenue Service (IRS) forms: 1099-DIV, 1099-INT, 1099-MISC, 1099-B and 1099-OID. You'll only receive the form(s) that apply to your particular financial situation and please keep for your records. Please note that information in the Year-End Summary is not provided to the IRS. It is provided to you as additional tax reporting information you may need to complete your tax return."
              },
              "boundingBox": {
                "left": 0.04482323232323232,
                "top": 0.190359477124183,
                "width": 0.8705808080808081,
                "height": 0.042483660130718956,
                "page": 2
              },
              "subtype": "string",
              "confidence": {
                "level": "high"
              }
            },
            {
              "type": "field",
              "label": "2 Other Periodic Interest",
              "reference": {
                "path": "forms.1099-OID.2_other_periodic_interest",
                "depth": 3
              },
              "value": {
                "original": "Your Form 1099 Composite may include the following Internal Revenue Service (IRS) forms: 1099-DIV, 1099-INT, 1099-MISC, 1099-B and 1099-OID. You'll only receive the form(s) that apply to your particular financial situation and please keep for your records. Please note that information in the Year-End Summary is not provided to the IRS. It is provided to you as additional tax reporting information you may need to complete your tax return.",
                "current": "Your Form 1099 Composite may include the following Internal Revenue Service (IRS) forms: 1099-DIV, 1099-INT, 1099-MISC, 1099-B and 1099-OID. You'll only receive the form(s) that apply to your particular financial situation and please keep for your records. Please note that information in the Year-End Summary is not provided to the IRS. It is provided to you as additional tax reporting information you may need to complete your tax return."
              },
              "boundingBox": {
                "left": 0.04482323232323232,
                "top": 0.190359477124183,
                "width": 0.8705808080808081,
                "height": 0.042483660130718956,
                "page": 2
              },
              "subtype": "string",
              "confidence": {
                "level": "high"
              }
            },
            {
              "type": "field",
              "label": "3 Early Withdrawal Penalty",
              "reference": {
                "path": "forms.1099-OID.3_early_withdrawal_penalty",
                "depth": 3
              },
              "value": {
                "original": "Your Form 1099 Composite may include the following Internal Revenue Service (IRS) forms: 1099-DIV, 1099-INT, 1099-MISC, 1099-B and 1099-OID. You'll only receive the form(s) that apply to your particular financial situation and please keep for your records. Please note that information in the Year-End Summary is not provided to the IRS. It is provided to you as additional tax reporting information you may need to complete your tax return.",
                "current": "Your Form 1099 Composite may include the following Internal Revenue Service (IRS) forms: 1099-DIV, 1099-INT, 1099-MISC, 1099-B and 1099-OID. You'll only receive the form(s) that apply to your particular financial situation and please keep for your records. Please note that information in the Year-End Summary is not provided to the IRS. It is provided to you as additional tax reporting information you may need to complete your tax return."
              },
              "boundingBox": {
                "left": 0.04482323232323232,
                "top": 0.190359477124183,
                "width": 0.8705808080808081,
                "height": 0.042483660130718956,
                "page": 2
              },
              "subtype": "string",
              "confidence": {
                "level": "high"
              }
            },
            {
              "type": "field",
              "label": "4 Federal Income Tax Withheld",
              "reference": {
                "path": "forms.1099-OID.4_federal_income_tax_withheld",
                "depth": 3
              },
              "value": {
                "original": "Your Form 1099 Composite may include the following Internal Revenue Service (IRS) forms: 1099-DIV, 1099-INT, 1099-MISC, 1099-B and 1099-OID. You'll only receive the form(s) that apply to your particular financial situation and please keep for your records. Please note that information in the Year-End Summary is not provided to the IRS. It is provided to you as additional tax reporting information you may need to complete your tax return.",
                "current": "Your Form 1099 Composite may include the following Internal Revenue Service (IRS) forms: 1099-DIV, 1099-INT, 1099-MISC, 1099-B and 1099-OID. You'll only receive the form(s) that apply to your particular financial situation and please keep for your records. Please note that information in the Year-End Summary is not provided to the IRS. It is provided to you as additional tax reporting information you may need to complete your tax return."
              },
              "boundingBox": {
                "left": 0.04482323232323232,
                "top": 0.190359477124183,
                "width": 0.8705808080808081,
                "height": 0.042483660130718956,
                "page": 2
              },
              "subtype": "string",
              "confidence": {
                "level": "high"
              }
            },
            {
              "type": "field",
              "label": "5 Market Discount",
              "reference": {
                "path": "forms.1099-OID.5_market_discount",
                "depth": 3
              },
              "value": {
                "original": "Your Form 1099 Composite may include the following Internal Revenue Service (IRS) forms: 1099-DIV, 1099-INT, 1099-MISC, 1099-B and 1099-OID. You'll only receive the form(s) that apply to your particular financial situation and please keep for your records. Please note that information in the Year-End Summary is not provided to the IRS. It is provided to you as additional tax reporting information you may need to complete your tax return.",
                "current": "Your Form 1099 Composite may include the following Internal Revenue Service (IRS) forms: 1099-DIV, 1099-INT, 1099-MISC, 1099-B and 1099-OID. You'll only receive the form(s) that apply to your particular financial situation and please keep for your records. Please note that information in the Year-End Summary is not provided to the IRS. It is provided to you as additional tax reporting information you may need to complete your tax return."
              },
              "boundingBox": {
                "left": 0.04482323232323232,
                "top": 0.190359477124183,
                "width": 0.8705808080808081,
                "height": 0.042483660130718956,
                "page": 2
              },
              "subtype": "string",
              "confidence": {
                "level": "high"
              }
            },
            {
              "type": "field",
              "label": "6 Acquisition Premium",
              "reference": {
                "path": "forms.1099-OID.6_acquisition_premium",
                "depth": 3
              },
              "value": {
                "original": "Your Form 1099 Composite may include the following Internal Revenue Service (IRS) forms: 1099-DIV, 1099-INT, 1099-MISC, 1099-B and 1099-OID. You'll only receive the form(s) that apply to your particular financial situation and please keep for your records. Please note that information in the Year-End Summary is not provided to the IRS. It is provided to you as additional tax reporting information you may need to complete your tax return.",
                "current": "Your Form 1099 Composite may include the following Internal Revenue Service (IRS) forms: 1099-DIV, 1099-INT, 1099-MISC, 1099-B and 1099-OID. You'll only receive the form(s) that apply to your particular financial situation and please keep for your records. Please note that information in the Year-End Summary is not provided to the IRS. It is provided to you as additional tax reporting information you may need to complete your tax return."
              },
              "boundingBox": {
                "left": 0.04482323232323232,
                "top": 0.190359477124183,
                "width": 0.8705808080808081,
                "height": 0.042483660130718956,
                "page": 2
              },
              "subtype": "string",
              "confidence": {
                "level": "high"
              }
            },
            {
              "type": "field",
              "label": "7 Description",
              "reference": {
                "path": "forms.1099-OID.7_description",
                "depth": 3
              },
              "value": {
                "original": "Your Form 1099 Composite may include the following Internal Revenue Service (IRS) forms: 1099-DIV, 1099-INT, 1099-MISC, 1099-B and 1099-OID. You'll only receive the form(s) that apply to your particular financial situation and please keep for your records. Please note that information in the Year-End Summary is not provided to the IRS. It is provided to you as additional tax reporting information you may need to complete your tax return.",
                "current": "Your Form 1099 Composite may include the following Internal Revenue Service (IRS) forms: 1099-DIV, 1099-INT, 1099-MISC, 1099-B and 1099-OID. You'll only receive the form(s) that apply to your particular financial situation and please keep for your records. Please note that information in the Year-End Summary is not provided to the IRS. It is provided to you as additional tax reporting information you may need to complete your tax return."
              },
              "boundingBox": {
                "left": 0.04482323232323232,
                "top": 0.190359477124183,
                "width": 0.8705808080808081,
                "height": 0.042483660130718956,
                "page": 2
              },
              "subtype": "string",
              "confidence": {
                "level": "high"
              }
            },
            {
              "type": "field",
              "label": "8 Original Issue Discount On Us Treasury",
              "reference": {
                "path": "forms.1099-OID.8_original_issue_discount_on_us_treasury",
                "depth": 3
              },
              "value": {
                "original": "Your Form 1099 Composite may include the following Internal Revenue Service (IRS) forms: 1099-DIV, 1099-INT, 1099-MISC, 1099-B and 1099-OID. You'll only receive the form(s) that apply to your particular financial situation and please keep for your records. Please note that information in the Year-End Summary is not provided to the IRS. It is provided to you as additional tax reporting information you may need to complete your tax return.",
                "current": "Your Form 1099 Composite may include the following Internal Revenue Service (IRS) forms: 1099-DIV, 1099-INT, 1099-MISC, 1099-B and 1099-OID. You'll only receive the form(s) that apply to your particular financial situation and please keep for your records. Please note that information in the Year-End Summary is not provided to the IRS. It is provided to you as additional tax reporting information you may need to complete your tax return."
              },
              "boundingBox": {
                "left": 0.04482323232323232,
                "top": 0.190359477124183,
                "width": 0.8705808080808081,
                "height": 0.042483660130718956,
                "page": 2
              },
              "subtype": "string",
              "confidence": {
                "level": "high"
              }
            },
            {
              "type": "field",
              "label": "9 Investment Expenses",
              "reference": {
                "path": "forms.1099-OID.9_investment_expenses",
                "depth": 3
              },
              "value": {
                "original": "Your Form 1099 Composite may include the following Internal Revenue Service (IRS) forms: 1099-DIV, 1099-INT, 1099-MISC, 1099-B and 1099-OID. You'll only receive the form(s) that apply to your particular financial situation and please keep for your records. Please note that information in the Year-End Summary is not provided to the IRS. It is provided to you as additional tax reporting information you may need to complete your tax return.",
                "current": "Your Form 1099 Composite may include the following Internal Revenue Service (IRS) forms: 1099-DIV, 1099-INT, 1099-MISC, 1099-B and 1099-OID. You'll only receive the form(s) that apply to your particular financial situation and please keep for your records. Please note that information in the Year-End Summary is not provided to the IRS. It is provided to you as additional tax reporting information you may need to complete your tax return."
              },
              "boundingBox": {
                "left": 0.04482323232323232,
                "top": 0.190359477124183,
                "width": 0.8705808080808081,
                "height": 0.042483660130718956,
                "page": 2
              },
              "subtype": "string",
              "confidence": {
                "level": "high"
              }
            }
          ]
        },
        {
          "type": "object",
          "label": "1099-Div",
          "reference": {
            "path": "forms.1099-DIV",
            "depth": 2
          },
          "children": [
            {
              "type": "field",
              "label": "10 Noncash Liquidation Distributions",
              "reference": {
                "path": "forms.1099-DIV.10_noncash_liquidation_distributions",
                "depth": 3
              },
              "value": {
                "original": "$ 0.00",
                "current": "$ 0.00"
              },
              "boundingBox": {
                "left": 0.8162878787878788,
                "top": 0.75,
                "width": 0.10795454545454546,
                "height": 0.01715686274509804,
                "page": 3
              },
              "subtype": "string",
              "confidence": {
                "level": "high"
              }
            },
            {
              "type": "field",
              "label": "12 Exempt Interest Dividends",
              "reference": {
                "path": "forms.1099-DIV.12_exempt_interest_dividends",
                "depth": 3
              },
              "value": {
                "original": "$ 0.00",
                "current": "$ 0.00"
              },
              "boundingBox": {
                "left": 0.8162878787878788,
                "top": 0.7655228758169934,
                "width": 0.10795454545454546,
                "height": 0.017973856209150325,
                "page": 3
              },
              "subtype": "string",
              "confidence": {
                "level": "high"
              }
            },
            {
              "type": "field",
              "label": "13 Specified Private Activity Bond Interest",
              "reference": {
                "path": "forms.1099-DIV.13_specified_private_activity_bond_interest",
                "depth": 3
              },
              "value": {
                "original": "$ 0.00",
                "current": "$ 0.00"
              },
              "boundingBox": {
                "left": 0.7007575757575758,
                "top": 0.798202614379085,
                "width": 0.11805555555555555,
                "height": 0.016339869281045753,
                "page": 3
              },
              "subtype": "string",
              "confidence": {
                "level": "high"
              }
            },
            {
              "type": "field",
              "label": "14 State",
              "reference": {
                "path": "forms.1099-DIV.14_state",
                "depth": 3
              },
              "value": {
                "original": "",
                "current": ""
              },
              "boundingBox": {
                "left": 0.8162878787878788,
                "top": 0.8145424836601307,
                "width": 0.10795454545454546,
                "height": 0.01715686274509804,
                "page": 3
              },
              "subtype": "string",
              "confidence": {
                "level": "high"
              }
            },
            {
              "type": "field",
              "label": "15 State Id Number",
              "reference": {
                "path": "forms.1099-DIV.15_state_id_number",
                "depth": 3
              },
              "value": {
                "original": "",
                "current": ""
              },
              "boundingBox": {
                "left": 0.8162878787878788,
                "top": 0.8300653594771242,
                "width": 0.10795454545454546,
                "height": 0.016339869281045753,
                "page": 3
              },
              "subtype": "string",
              "confidence": {
                "level": "high"
              }
            },
            {
              "type": "field",
              "label": "16 State Tax Withheld",
              "reference": {
                "path": "forms.1099-DIV.16_state_tax_withheld",
                "depth": 3
              },
              "value": {
                "original": "$ 0.00",
                "current": "$ 0.00"
              },
              "boundingBox": {
                "left": 0.8162878787878788,
                "top": 0.8464052287581699,
                "width": 0.10795454545454546,
                "height": 0.01715686274509804,
                "page": 3
              },
              "subtype": "string",
              "confidence": {
                "level": "high"
              }
            },
            {
              "type": "field",
              "label": "1A Total Ordinary Dividends",
              "reference": {
                "path": "forms.1099-DIV.1a_total_ordinary_dividends",
                "depth": 3
              },
              "value": {
                "original": "1,235.91",
                "current": "1,235.91"
              },
              "boundingBox": {
                "left": 0.8857323232323232,
                "top": 0.4812091503267974,
                "width": 0.037247474747474696,
                "height": 0.008986928104575187,
                "page": 3
              },
              "subtype": "number",
              "confidence": {
                "level": "high"
              }
            },
            {
              "type": "field",
              "label": "1B Qualified Dividends",
              "reference": {
                "path": "forms.1099-DIV.1b_qualified_dividends",
                "depth": 3
              },
              "value": {
                "original": "1,164.39",
                "current": "1,164.39"
              },
              "boundingBox": {
                "left": 0.7714646464646465,
                "top": 0.5122549019607843,
                "width": 0.037878787878787845,
                "height": 0.0106209150326797,
                "page": 3
              },
              "subtype": "number",
              "confidence": {
                "level": "high"
              }
            },
            {
              "type": "field",
              "label": "2A Total Capital Gain Distributions",
              "reference": {
                "path": "forms.1099-DIV.2a_total_capital_gain_distributions",
                "depth": 3
              },
              "value": {
                "original": "$ 0.00",
                "current": "$ 0.00"
              },
              "boundingBox": {
                "left": 0.8162878787878788,
                "top": 0.5245098039215687,
                "width": 0.10795454545454546,
                "height": 0.016339869281045753,
                "page": 3
              },
              "subtype": "string",
              "confidence": {
                "level": "high"
              }
            },
            {
              "type": "field",
              "label": "2B Unrecaptured Sec1250 Gain",
              "reference": {
                "path": "forms.1099-DIV.2b_unrecaptured_sec1250_gain",
                "depth": 3
              },
              "value": {
                "original": "$ 0.00",
                "current": "$ 0.00"
              },
              "boundingBox": {
                "left": 0.7007575757575758,
                "top": 0.5571895424836601,
                "width": 0.11805555555555555,
                "height": 0.016339869281045753,
                "page": 3
              },
              "subtype": "string",
              "confidence": {
                "level": "high"
              }
            },
            {
              "type": "field",
              "label": "2C Section1202 Gain",
              "reference": {
                "path": "forms.1099-DIV.2c_section1202_gain",
                "depth": 3
              },
              "value": {
                "original": "$ 0.00",
                "current": "$ 0.00"
              },
              "boundingBox": {
                "left": 0.7007575757575758,
                "top": 0.5727124183006536,
                "width": 0.11805555555555555,
                "height": 0.01715686274509804,
                "page": 3
              },
              "subtype": "string",
              "confidence": {
                "level": "high"
              }
            },
            {
              "type": "field",
              "label": "2D Collectibles 28Pct Gain",
              "reference": {
                "path": "forms.1099-DIV.2d_collectibles_28pct_gain",
                "depth": 3
              },
              "value": {
                "original": "$ 0.00",
                "current": "$ 0.00"
              },
              "boundingBox": {
                "left": 0.7007575757575758,
                "top": 0.5882352941176471,
                "width": 0.11805555555555555,
                "height": 0.01715686274509804,
                "page": 3
              },
              "subtype": "string",
              "confidence": {
                "level": "high"
              }
            },
            {
              "type": "field",
              "label": "3 Nondividend Distributions",
              "reference": {
                "path": "forms.1099-DIV.3_nondividend_distributions",
                "depth": 3
              },
              "value": {
                "original": "$ 0.00",
                "current": "$ 0.00"
              },
              "boundingBox": {
                "left": 0.8162878787878788,
                "top": 0.6372549019607843,
                "width": 0.10795454545454546,
                "height": 0.01715686274509804,
                "page": 3
              },
              "subtype": "string",
              "confidence": {
                "level": "high"
              }
            },
            {
              "type": "field",
              "label": "4 Federal Income Tax Withheld",
              "reference": {
                "path": "forms.1099-DIV.4_federal_income_tax_withheld",
                "depth": 3
              },
              "value": {
                "original": "$ 0.00",
                "current": "$ 0.00"
              },
              "boundingBox": {
                "left": 0.8162878787878788,
                "top": 0.6527777777777778,
                "width": 0.10795454545454546,
                "height": 0.01715686274509804,
                "page": 3
              },
              "subtype": "string",
              "confidence": {
                "level": "high"
              }
            },
            {
              "type": "field",
              "label": "5 Section 199 A Dividends",
              "reference": {
                "path": "forms.1099-DIV.5_section_199A_dividends",
                "depth": 3
              },
              "value": {
                "original": "48.92",
                "current": "48.92"
              },
              "boundingBox": {
                "left": 0.7847222222222222,
                "top": 0.6740196078431373,
                "width": 0.024621212121212155,
                "height": 0.008169934640522847,
                "page": 3
              },
              "subtype": "number",
              "confidence": {
                "level": "high"
              }
            },
            {
              "type": "field",
              "label": "6 Investment Expenses",
              "reference": {
                "path": "forms.1099-DIV.6_investment_expenses",
                "depth": 3
              },
              "value": {
                "original": "$ 0.00",
                "current": "$ 0.00"
              },
              "boundingBox": {
                "left": 0.8162878787878788,
                "top": 0.6854575163398693,
                "width": 0.10795454545454546,
                "height": 0.01715686274509804,
                "page": 3
              },
              "subtype": "string",
              "confidence": {
                "level": "high"
              }
            },
            {
              "type": "field",
              "label": "7 Foreign Tax Paid",
              "reference": {
                "path": "forms.1099-DIV.7_foreign_tax_paid",
                "depth": 3
              },
              "value": {
                "original": "$ 0.00",
                "current": "$ 0.00"
              },
              "boundingBox": {
                "left": 0.8162878787878788,
                "top": 0.701797385620915,
                "width": 0.10795454545454546,
                "height": 0.016339869281045753,
                "page": 3
              },
              "subtype": "string",
              "confidence": {
                "level": "high"
              }
            },
            {
              "type": "field",
              "label": "8 Foreign Country",
              "reference": {
                "path": "forms.1099-DIV.8_foreign_country",
                "depth": 3
              },
              "value": {
                "original": "",
                "current": ""
              },
              "boundingBox": {
                "left": 0.8162878787878788,
                "top": 0.7173202614379085,
                "width": 0.10795454545454546,
                "height": 0.01715686274509804,
                "page": 3
              },
              "subtype": "string",
              "confidence": {
                "level": "high"
              }
            },
            {
              "type": "field",
              "label": "9 Cash Liquidation Distributions",
              "reference": {
                "path": "forms.1099-DIV.9_cash_liquidation_distributions",
                "depth": 3
              },
              "value": {
                "original": "$ 0.00",
                "current": "$ 0.00"
              },
              "boundingBox": {
                "left": 0.8162878787878788,
                "top": 0.7336601307189542,
                "width": 0.10795454545454546,
                "height": 0.016339869281045753,
                "page": 3
              },
              "subtype": "string",
              "confidence": {
                "level": "high"
              }
            }
          ]
        },
        {
          "type": "object",
          "label": "1099-Int",
          "reference": {
            "path": "forms.1099-INT",
            "depth": 2
          },
          "children": [
            {
              "type": "field",
              "label": "10 Market Discount",
              "reference": {
                "path": "forms.1099-INT.10_market_discount",
                "depth": 3
              },
              "value": {
                "original": "$ 0.00",
                "current": "$ 0.00"
              },
              "boundingBox": {
                "left": 0.8112373737373737,
                "top": 0.6397058823529411,
                "width": 0.10984848484848485,
                "height": 0.02042483660130719,
                "page": 5
              },
              "subtype": "string",
              "confidence": {
                "level": "high"
              }
            },
            {
              "type": "field",
              "label": "11 Bond Premium",
              "reference": {
                "path": "forms.1099-INT.11_bond_premium",
                "depth": 3
              },
              "value": {
                "original": "$ 0.00",
                "current": "$ 0.00"
              },
              "boundingBox": {
                "left": 0.8112373737373737,
                "top": 0.6593137254901961,
                "width": 0.10984848484848485,
                "height": 0.021241830065359478,
                "page": 5
              },
              "subtype": "string",
              "confidence": {
                "level": "high"
              }
            },
            {
              "type": "field",
              "label": "12 Bond Premium Treasury",
              "reference": {
                "path": "forms.1099-INT.12_bond_premium_treasury",
                "depth": 3
              },
              "value": {
                "original": "$ 0.00",
                "current": "$ 0.00"
              },
              "boundingBox": {
                "left": 0.8112373737373737,
                "top": 0.6797385620915033,
                "width": 0.10984848484848485,
                "height": 0.02042483660130719,
                "page": 5
              },
              "subtype": "string",
              "confidence": {
                "level": "high"
              }
            },
            {
              "type": "field",
              "label": "13 Bond Premium Tax Exempt",
              "reference": {
                "path": "forms.1099-INT.13_bond_premium_tax_exempt",
                "depth": 3
              },
              "value": {
                "original": "$ 0.00",
                "current": "$ 0.00"
              },
              "boundingBox": {
                "left": 0.8112373737373737,
                "top": 0.6993464052287581,
                "width": 0.10984848484848485,
                "height": 0.02042483660130719,
                "page": 5
              },
              "subtype": "string",
              "confidence": {
                "level": "high"
              }
            },
            {
              "type": "field",
              "label": "14 Tax Exempt Cusip",
              "reference": {
                "path": "forms.1099-INT.14_tax_exempt_cusip",
                "depth": 3
              },
              "value": {
                "original": "",
                "current": ""
              },
              "boundingBox": {
                "left": 0.8112373737373737,
                "top": 0.7197712418300654,
                "width": 0.10984848484848485,
                "height": 0.02042483660130719,
                "page": 5
              },
              "subtype": "string",
              "confidence": {
                "level": "high"
              }
            },
            {
              "type": "field",
              "label": "15 State",
              "reference": {
                "path": "forms.1099-INT.15_state",
                "depth": 3
              },
              "value": {
                "original": "",
                "current": ""
              },
              "boundingBox": {
                "left": 0.8112373737373737,
                "top": 0.7401960784313726,
                "width": 0.10984848484848485,
                "height": 0.02042483660130719,
                "page": 5
              },
              "subtype": "string",
              "confidence": {
                "level": "high"
              }
            },
            {
              "type": "field",
              "label": "16 State Id Number",
              "reference": {
                "path": "forms.1099-INT.16_state_id_number",
                "depth": 3
              },
              "value": {
                "original": "",
                "current": ""
              },
              "boundingBox": {
                "left": 0.8112373737373737,
                "top": 0.7598039215686274,
                "width": 0.10984848484848485,
                "height": 0.021241830065359478,
                "page": 5
              },
              "subtype": "string",
              "confidence": {
                "level": "high"
              }
            },
            {
              "type": "field",
              "label": "17 State Tax Withheld",
              "reference": {
                "path": "forms.1099-INT.17_state_tax_withheld",
                "depth": 3
              },
              "value": {
                "original": "$ 0.00",
                "current": "$ 0.00"
              },
              "boundingBox": {
                "left": 0.8112373737373737,
                "top": 0.7802287581699346,
                "width": 0.10984848484848485,
                "height": 0.021241830065359478,
                "page": 5
              },
              "subtype": "string",
              "confidence": {
                "level": "high"
              }
            },
            {
              "type": "field",
              "label": "1 Interest Income",
              "reference": {
                "path": "forms.1099-INT.1_interest_income",
                "depth": 3
              },
              "value": {
                "original": "9.35",
                "current": "9.35"
              },
              "boundingBox": {
                "left": 0.8977272727272727,
                "top": 0.48284313725490197,
                "width": 0.022727272727272707,
                "height": 0.010620915032679756,
                "page": 5
              },
              "subtype": "number",
              "confidence": {
                "level": "high"
              }
            },
            {
              "type": "field",
              "label": "3 Us Savings Bond Treasury Interest",
              "reference": {
                "path": "forms.1099-INT.3_us_savings_bond_treasury_interest",
                "depth": 3
              },
              "value": {
                "original": "$ 0.00",
                "current": "$ 0.00"
              },
              "boundingBox": {
                "left": 0.8112373737373737,
                "top": 0.49754901960784315,
                "width": 0.10984848484848485,
                "height": 0.02042483660130719,
                "page": 5
              },
              "subtype": "string",
              "confidence": {
                "level": "high"
              }
            },
            {
              "type": "field",
              "label": "4 Federal Income Tax Withheld",
              "reference": {
                "path": "forms.1099-INT.4_federal_income_tax_withheld",
                "depth": 3
              },
              "value": {
                "original": "$ 0.00",
                "current": "$ 0.00"
              },
              "boundingBox": {
                "left": 0.8112373737373737,
                "top": 0.5179738562091504,
                "width": 0.10984848484848485,
                "height": 0.022058823529411766,
                "page": 5
              },
              "subtype": "string",
              "confidence": {
                "level": "high"
              }
            },
            {
              "type": "field",
              "label": "5 Investment Expenses",
              "reference": {
                "path": "forms.1099-INT.5_investment_expenses",
                "depth": 3
              },
              "value": {
                "original": "$ 0.00",
                "current": "$ 0.00"
              },
              "boundingBox": {
                "left": 0.8112373737373737,
                "top": 0.5392156862745098,
                "width": 0.10984848484848485,
                "height": 0.021241830065359478,
                "page": 5
              },
              "subtype": "string",
              "confidence": {
                "level": "high"
              }
            },
            {
              "type": "field",
              "label": "6 Foreign Tax Paid",
              "reference": {
                "path": "forms.1099-INT.6_foreign_tax_paid",
                "depth": 3
              },
              "value": {
                "original": "$ 0.00",
                "current": "$ 0.00"
              },
              "boundingBox": {
                "left": 0.8112373737373737,
                "top": 0.559640522875817,
                "width": 0.10984848484848485,
                "height": 0.021241830065359478,
                "page": 5
              },
              "subtype": "string",
              "confidence": {
                "level": "high"
              }
            },
            {
              "type": "field",
              "label": "7 Foreign Country",
              "reference": {
                "path": "forms.1099-INT.7_foreign_country",
                "depth": 3
              },
              "value": {
                "original": "",
                "current": ""
              },
              "boundingBox": {
                "left": 0.8112373737373737,
                "top": 0.5800653594771242,
                "width": 0.10984848484848485,
                "height": 0.02042483660130719,
                "page": 5
              },
              "subtype": "string",
              "confidence": {
                "level": "high"
              }
            },
            {
              "type": "field",
              "label": "8 Tax Exempt Interest",
              "reference": {
                "path": "forms.1099-INT.8_tax_exempt_interest",
                "depth": 3
              },
              "value": {
                "original": "$ 0.00",
                "current": "$ 0.00"
              },
              "boundingBox": {
                "left": 0.8112373737373737,
                "top": 0.5996732026143791,
                "width": 0.10984848484848485,
                "height": 0.02042483660130719,
                "page": 5
              },
              "subtype": "string",
              "confidence": {
                "level": "high"
              }
            },
            {
              "type": "field",
              "label": "9 Private Activity Bond Interest",
              "reference": {
                "path": "forms.1099-INT.9_private_activity_bond_interest",
                "depth": 3
              },
              "value": {
                "original": "$ 0.00",
                "current": "$ 0.00"
              },
              "boundingBox": {
                "left": 0.8112373737373737,
                "top": 0.6200980392156863,
                "width": 0.10984848484848485,
                "height": 0.02042483660130719,
                "page": 5
              },
              "subtype": "string",
              "confidence": {
                "level": "high"
              }
            }
          ]
        },
        {
          "type": "object",
          "label": "1099-B",
          "reference": {
            "path": "forms.1099-B",
            "depth": 2
          },
          "children": [
            {
              "type": "object",
              "label": "Short Term",
              "reference": {
                "path": "forms.1099-B.short_term",
                "depth": 3
              },
              "children": [
                {
                  "type": "field",
                  "label": "Cost Basis",
                  "reference": {
                    "path": "forms.1099-B.short_term.cost_basis",
                    "depth": 4
                  },
                  "value": {
                    "original": "3,115.54",
                    "current": "3,115.54"
                  },
                  "boundingBox": {
                    "left": 0.3939393939393939,
                    "top": 0.4485294117647059,
                    "width": 0.08396464646464646,
                    "height": 0.042483660130718956,
                    "page": 9
                  },
                  "subtype": "number",
                  "confidence": {
                    "level": "high"
                  }
                },
                {
                  "type": "field",
                  "label": "Gain Loss",
                  "reference": {
                    "path": "forms.1099-B.short_term.gain_loss",
                    "depth": 4
                  },
                  "value": {
                    "original": "",
                    "current": ""
                  },
                  "boundingBox": {
                    "left": 0.6338383838383839,
                    "top": 0.4485294117647059,
                    "width": 0.07512626262626262,
                    "height": 0.042483660130718956,
                    "page": 9
                  },
                  "subtype": "string",
                  "confidence": {
                    "level": "high"
                  }
                },
                {
                  "type": "field",
                  "label": "Proceeds",
                  "reference": {
                    "path": "forms.1099-B.short_term.proceeds",
                    "depth": 4
                  },
                  "value": {
                    "original": "$",
                    "current": "$"
                  },
                  "boundingBox": {
                    "left": 0.32512626262626265,
                    "top": 0.4485294117647059,
                    "width": 0.05555555555555555,
                    "height": 0.042483660130718956,
                    "page": 9
                  },
                  "subtype": "string",
                  "confidence": {
                    "level": "high"
                  }
                },
                {
                  "type": "field",
                  "label": "State",
                  "reference": {
                    "path": "forms.1099-B.short_term.state",
                    "depth": 4
                  },
                  "value": {
                    "original": "1c-Date\nsold or\ndisposed",
                    "current": "1c-Date\nsold or\ndisposed"
                  },
                  "boundingBox": {
                    "left": 0.32512626262626265,
                    "top": 0.30800653594771243,
                    "width": 0.05555555555555555,
                    "height": 0.049019607843137254,
                    "page": 9
                  },
                  "subtype": "string",
                  "confidence": {
                    "level": "high"
                  }
                },
                {
                  "type": "field",
                  "label": "State Id Number",
                  "reference": {
                    "path": "forms.1099-B.short_term.state_id_number",
                    "depth": 4
                  },
                  "value": {
                    "original": "6-Reported to IRS:\nGross Proceeds\n(except where\nindicated)",
                    "current": "6-Reported to IRS:\nGross Proceeds\n(except where\nindicated)"
                  },
                  "boundingBox": {
                    "left": 0.3939393939393939,
                    "top": 0.30800653594771243,
                    "width": 0.08396464646464646,
                    "height": 0.049019607843137254,
                    "page": 9
                  },
                  "subtype": "string",
                  "confidence": {
                    "level": "high"
                  }
                },
                {
                  "type": "field",
                  "label": "Federal Tax Withheld",
                  "reference": {
                    "path": "forms.1099-B.short_term.federal_tax_withheld",
                    "depth": 4
                  },
                  "value": {
                    "original": "0",
                    "current": "0"
                  },
                  "boundingBox": null,
                  "subtype": "number",
                  "confidence": {
                    "level": null
                  }
                },
                {
                  "type": "field",
                  "label": "State Tax Withheld",
                  "reference": {
                    "path": "forms.1099-B.short_term.state_tax_withheld",
                    "depth": 4
                  },
                  "value": {
                    "original": "0",
                    "current": "0"
                  },
                  "boundingBox": null,
                  "subtype": "number",
                  "confidence": {
                    "level": null
                  }
                }
              ]
            },
            {
              "type": "object",
              "label": "Long Term",
              "reference": {
                "path": "forms.1099-B.long_term",
                "depth": 3
              },
              "children": [
                {
                  "type": "field",
                  "label": "Cost Basis",
                  "reference": {
                    "path": "forms.1099-B.long_term.cost_basis",
                    "depth": 4
                  },
                  "value": {
                    "original": "$ 90,671.83",
                    "current": "$ 90,671.83"
                  },
                  "boundingBox": {
                    "left": 0.49053030303030304,
                    "top": 0.4485294117647059,
                    "width": 0.10227272727272728,
                    "height": 0.041666666666666664,
                    "page": 13
                  },
                  "subtype": "string",
                  "confidence": {
                    "level": "high"
                  }
                },
                {
                  "type": "field",
                  "label": "Federal Tax Withheld",
                  "reference": {
                    "path": "forms.1099-B.long_term.federal_tax_withheld",
                    "depth": 4
                  },
                  "value": {
                    "original": "0.00",
                    "current": "0.00"
                  },
                  "boundingBox": {
                    "left": 0.8409090909090909,
                    "top": 0.4485294117647059,
                    "width": 0.08270202020202021,
                    "height": 0.041666666666666664,
                    "page": 13
                  },
                  "subtype": "number",
                  "confidence": {
                    "level": "high"
                  }
                },
                {
                  "type": "field",
                  "label": "Gain Loss",
                  "reference": {
                    "path": "forms.1099-B.long_term.gain_loss",
                    "depth": 4
                  },
                  "value": {
                    "original": "$ 71.16 $",
                    "current": "$ 71.16 $"
                  },
                  "boundingBox": {
                    "left": 0.7159090909090909,
                    "top": 0.4485294117647059,
                    "width": 0.11237373737373738,
                    "height": 0.041666666666666664,
                    "page": 13
                  },
                  "subtype": "string",
                  "confidence": {
                    "level": "high"
                  }
                },
                {
                  "type": "field",
                  "label": "Proceeds",
                  "reference": {
                    "path": "forms.1099-B.long_term.proceeds",
                    "depth": 4
                  },
                  "value": {
                    "original": "90,742.99",
                    "current": "90,742.99"
                  },
                  "boundingBox": {
                    "left": 0.3939393939393939,
                    "top": 0.4485294117647059,
                    "width": 0.0845959595959596,
                    "height": 0.041666666666666664,
                    "page": 13
                  },
                  "subtype": "number",
                  "confidence": {
                    "level": "high"
                  }
                },
                {
                  "type": "field",
                  "label": "State",
                  "reference": {
                    "path": "forms.1099-B.long_term.state",
                    "depth": 4
                  },
                  "value": {
                    "original": "6-Reported to IRS: Gross proceeds (except where indicated)",
                    "current": "6-Reported to IRS: Gross proceeds (except where indicated)"
                  },
                  "boundingBox": {
                    "left": 0.3939393939393939,
                    "top": 0.30718954248366015,
                    "width": 0.0845959595959596,
                    "height": 0.04820261437908497,
                    "page": 13
                  },
                  "subtype": "string",
                  "confidence": {
                    "level": "high"
                  }
                },
                {
                  "type": "field",
                  "label": "State Id Number",
                  "reference": {
                    "path": "forms.1099-B.long_term.state_id_number",
                    "depth": 4
                  },
                  "value": {
                    "original": "",
                    "current": ""
                  },
                  "boundingBox": {
                    "left": 0.49053030303030304,
                    "top": 0.30718954248366015,
                    "width": 0.10227272727272728,
                    "height": 0.04820261437908497,
                    "page": 13
                  },
                  "subtype": "string",
                  "confidence": {
                    "level": "high"
                  }
                },
                {
                  "type": "field",
                  "label": "State Tax Withheld",
                  "reference": {
                    "path": "forms.1099-B.long_term.state_tax_withheld",
                    "depth": 4
                  },
                  "value": {
                    "original": "",
                    "current": ""
                  },
                  "boundingBox": {
                    "left": 0.8409090909090909,
                    "top": 0.30718954248366015,
                    "width": 0.08270202020202021,
                    "height": 0.04820261437908497,
                    "page": 13
                  },
                  "subtype": "string",
                  "confidence": {
                    "level": "high"
                  }
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "type": "object",
      "label": "Payer",
      "reference": {
        "path": "payer",
        "depth": 1
      },
      "children": [
        {
          "type": "field",
          "label": "Address",
          "reference": {
            "path": "payer.address",
            "depth": 2
          },
          "value": {
            "original": "CHARLES SCHWAB & CO., INC.\n3000 SCHWAB WAY\nWESTLAKE, TX 76262",
            "current": "CHARLES SCHWAB & CO., INC.\n3000 SCHWAB WAY\nWESTLAKE, TX 76262"
          },
          "boundingBox": {
            "left": 0.5220959595959596,
            "top": 0.21650326797385622,
            "width": 0.17045454545454544,
            "height": 0.049019607843137254,
            "page": 3
          },
          "subtype": "string",
          "confidence": {
            "level": "high"
          }
        },
        {
          "type": "field",
          "label": "Federal Id",
          "reference": {
            "path": "payer.federal_id",
            "depth": 2
          },
          "value": {
            "original": "94-1737782",
            "current": "94-1737782"
          },
          "boundingBox": {
            "left": 0.6357323232323232,
            "top": 0.29983660130718953,
            "width": 0.06060606060606066,
            "height": 0.010620915032679756,
            "page": 3
          },
          "subtype": "string",
          "confidence": {
            "level": "high"
          }
        },
        {
          "type": "field",
          "label": "Name",
          "reference": {
            "path": "payer.name",
            "depth": 2
          },
          "value": {
            "original": "CHARLES SCHWAB & CO., INC.\n3000 SCHWAB WAY\nWESTLAKE, TX 76262",
            "current": "CHARLES SCHWAB & CO., INC.\n3000 SCHWAB WAY\nWESTLAKE, TX 76262"
          },
          "boundingBox": {
            "left": 0.5220959595959596,
            "top": 0.21650326797385622,
            "width": 0.17045454545454544,
            "height": 0.049019607843137254,
            "page": 3
          },
          "subtype": "string",
          "confidence": {
            "level": "high"
          }
        },
        {
          "type": "field",
          "label": "Phone",
          "reference": {
            "path": "payer.phone",
            "depth": 2
          },
          "value": {
            "original": "Telephone Number: (800) 435-4000",
            "current": "Telephone Number: (800) 435-4000"
          },
          "boundingBox": {
            "left": 0.5220959595959596,
            "top": 0.28022875816993464,
            "width": 0.19191919191919193,
            "height": 0.01470588235294118,
            "page": 3
          },
          "subtype": "string",
          "confidence": {
            "level": "high"
          }
        }
      ]
    }
  ]
};