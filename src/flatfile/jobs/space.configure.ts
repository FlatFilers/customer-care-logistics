import type { FlatfileListener } from "@flatfile/listener";
import type { SetupFactory } from "@flatfile/plugin-space-configure";

import { configureSpace } from "@flatfile/plugin-space-configure";
import welcomeToFlatfileDocument from "../blueprints/documents/welcome.to.flatfile";
import { surveyResponses } from "../blueprints/workbooks/survey.responses";
import { infectionEvents } from "../blueprints/workbooks/infection.events";

export default async function spaceConfigure(listener: FlatfileListener) {
  const config: SetupFactory = {
    workbooks: [infectionEvents, surveyResponses],
    documents: [welcomeToFlatfileDocument],
    space: {
      metadata: {
        theme: {
          root: {
            primaryColor: "rgb(89, 170, 216)",
          },
          sidebar: {
            logo: "https://images.squarespace-cdn.com/content/v1/64b045bf07de7b3e0c3106dc/72967f99-1e0a-4d59-8e13-6045e88dc367/Untitled+design.png?format=1500w",
            titleColor: "rgb(89, 170, 216)",
          },
        },
      },
    },
    config: {
      maintainWorkbookOrder: true,
    },
  };

  listener.use(configureSpace(config));
}
