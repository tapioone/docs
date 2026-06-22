import type { SidebarsConfig } from "@docusaurus/plugin-content-docs";

const sidebar: SidebarsConfig = {
  apisidebar: [
    {
      type: "doc",
      id: "api/application-api/application-api",
    },
    {
      type: "category",
      label: "ConsentSubject",
      link: {
        type: "doc",
        id: "api/application-api/consent-subject",
      },
      items: [
        {
          type: "doc",
          id: "api/application-api/get-consent-subjects",
          label: "Gets Consent Subjects",
          className: "api-method get",
        },
      ],
    },
    {
      type: "category",
      label: "Me",
      link: {
        type: "doc",
        id: "api/application-api/me",
      },
      items: [
        {
          type: "doc",
          id: "api/application-api/grant-consent",
          label: "Grant Consent",
          className: "api-method post",
        },
        {
          type: "doc",
          id: "api/application-api/evaluate-consent",
          label: "Evaluate user consent",
          className: "api-method post",
        },
      ],
    },
    {
      type: "category",
      label: "Subscription",
      link: {
        type: "doc",
        id: "api/application-api/subscription",
      },
      items: [
        {
          type: "doc",
          id: "api/application-api/evaluate-subscription-consent",
          label: "Evaluate subscription consent",
          className: "api-method post",
        },
      ],
    },
  ],
};

export default sidebar.apisidebar;
