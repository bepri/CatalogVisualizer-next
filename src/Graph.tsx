import { useMemo, useRef, useState } from "react";

import {
  Box,
  LoadingOverlay,
  Card,
  ScrollArea,
  Select,
  Stack,
  Group,
  Text,
  Space,
} from "@mantine/core";

import { useQuery } from "react-query";

import { useHover } from "@mantine/hooks";

import pluralize from "pluralize";

export default function Graph() {
  // asynchronously retrieve the catalogs
  const {
    isLoading,
    error: catError,
    data: catalogsRaw,
  } = useQuery("catalogs", () =>
    fetch("./catalogs.json").then((res) => res.json())
  );

  const catalogChoices = useMemo(() => getChoices(catalogsRaw), [catalogsRaw]);

  // sort years in descending order for the drop-down (newest year at top of drop-down)
  const yearChoices = useMemo(
    () =>
      Object.keys(catalogChoices)
        .sort((a, b) =>
          a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
        )
        .reverse(),
    [catalogChoices]
  );

  const [catYear, setCatYear] = useState<string | null>(null);

  // retrieve only the majors that are actually available to study that year
  const majorChoices = useMemo(() => {
    if (Object.keys(catalogChoices).length == 0) {
      return [];
    } else {
      return (catalogChoices[catYear as keyof Object] as unknown as string[])
        .sort()
        .map((mj) => mj.toUpperCase());
    }
  }, [catYear]);

  const [catMajor, setCatMajor] = useState<string | null>(null);

  // convert the user's selections into the string to index into the catalog JSON file
  const selectedCatalog = (() => {
    if (catMajor == null || catYear == null || catalogsRaw == null)
      return new Catalog();

    return (catalogsRaw as object)[
      `${catMajor?.toLowerCase()}_${catYear}` as keyof Object
    ] as object as Catalog;
  })();

  return (
    <Box style={{ overflow: "hidden", padding: "1em" }}>
      <Group justify="center" style={{ padding: "1em" }}>
        <Select label="Catalog year" data={yearChoices} onChange={setCatYear} />
        <Select
          label="Catalog major"
          data={majorChoices}
          onChange={setCatMajor}
          disabled={catYear == null}
        />
      </Group>
      <Stack>
        <ScrollArea.Autosize pos="relative" type="auto" mah="100%">
          <LoadingOverlay
            visible={!isLoading}
            overlayProps={{ radius: "sm", blur: 2, fixed: true }}
          />
          <Stack align="center">
            <Space />
            <Nodes catalog={selectedCatalog} />
          </Stack>
        </ScrollArea.Autosize>
      </Stack>
    </Box>
  );
}

class Course {
  hours: number = 0;
  title: string = "";
  term: number = 0;
}

type Edge = [string, string];

class Catalog {
  nodes: Course[] = [];
  edges: {
    prerequisites: Edge[];
    corequisites: Edge[];
  } = {
    prerequisites: [],
    corequisites: [],
  };
}

function Nodes(props: { catalog: Catalog }) {
  const catalog = props["catalog"];

  // create hooks for tracking whether or not each node is hovered over
  const highlights: {
    [key: string]: React.MutableRefObject<string>;
  } = {};
  Object.keys(catalog.nodes).forEach((id) => {
    highlights[id as keyof Object] = useRef("none");
  });

  return (
    <>
      {Object.entries(catalog.nodes).map((node, idx) => {
        const id = node[0];
        const course = node[1];
        const { hovered, ref } = useHover();
        // generate our list of pre- and coreqs
        const [prereqs, coreqs] = useMemo(() => {
          let prereqs: string[] = [];
          let coreqs: string[] = [];

          for (const prereq of catalog.edges.prerequisites) {
            // if this course has a prereq, store that prereq
            if (prereq[1] === id) {
              prereqs.push(prereq[0]);
            }
          }

          for (const coreq of catalog.edges.corequisites) {
            // with coreqs, there's no need to store something like [cosc101, cosc102] if we're talking about cosc101 in the
            // first place. just store the other course
            if (coreq.includes(id)) {
              coreqs.push(coreq.filter((course) => course !== id)[0]);
            }
          }

          return [prereqs, coreqs];
        }, []);

        // only update course highlighting if hover state changed
        useMemo(() => {
          if (hovered) {
            for (const prereq of prereqs) {
              highlights[prereq].current = "pre";
            }
            for (const coreq of coreqs) {
              highlights[coreq].current = "co";
            }
          } else {
            for (const req of prereqs.concat(coreqs)) {
              highlights[req].current = "none";
            }
          }
        }, [hovered]);

        return (
          <Card
            shadow={highlights[id].current === "none" ? "sm" : undefined}
            padding="lg"
            radius="lg"
            withBorder
            key={`course_${idx}`}
            w="30em"
            ref={ref}
            style={
              highlights[id].current === "none"
                ? undefined
                : {
                    boxShadow: "0 0 1em rgba(255, 130, 0, 0.8)",
                  }
            }
          >
            <Card.Section>
              <Text ta="center" m="0.2em">
                {highlights[id].current === "none" ? (
                  ""
                ) : (
                  <Text span fw={700}>
                    ({highlights[id].current.toUpperCase()}){" "}
                  </Text>
                )}
                {course.title}
              </Text>
            </Card.Section>
            <Card.Section>
              <Text ta="center" m="0.2em">
                {pluralize("credit hour", course.hours, true)}
              </Text>
            </Card.Section>
          </Card>
        );
      })}
    </>
  );
}

// function getChoices(catalogsRaw: object) {
//   // Creates an object with the following scaffolding:
//   // {
//   //   "2023": [
//   //      "cs", "ce", ee"
//   //   ],
//   //   "2024": [
//   //      "cs", "ee"
//   //   ]
//   // }
//   // from the catalogs.json file, based upon the existence of root-level keys in that file named:
//   // "cs_2023", "ce_2023", "ee_2023", "cs_2024", and "ee_2024"
//   const choices = Object.keys(catalogsRaw ?? {})
//     .map((key) => {
//       // Split on the underscores and then return the two parts as a tuple (intentionally reversed)
//       const parts = key.split("_");
//       return [parts[1], parts[0]];
//     })
//     .reduce((acc, catalog) => {
//       // Create a mapping of years to available degree paths for that year (e.g. 2023 -> [cs, ce, ee])
//       if (acc[catalog[0] as keyof Object]) {
//         (acc[catalog[0] as keyof Object] as unknown as string[]).push(
//           catalog[1]
//         );
//       } else {
//         (acc[catalog[0] as keyof Object] as unknown as string[]) = [catalog[1]];
//       }

//       return acc;
//     }, {});

//   const yearChoices = (() =>
//     Object.keys(choices)
//       .sort((a, b) =>
//         a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
//       )
//       .reverse())();

//   const majorChoices = (() => {
//     if (Object.keys(choices).length == 0) {
//       return [];
//     } else {
//       return (choices[catYear as keyof Object] as unknown as string[])
//         .sort()
//         .map((mj) => mj.toUpperCase());
//     }
//   })();
// }
