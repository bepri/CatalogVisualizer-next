<center>
    <h1>Catalog Visualizer</h1>
    <h2>Functional & Implementation Specification</h2>
    This document specifies a potential final product for a catalog visualization program. It was written for Dr. Michael Berry @ EECS UTK. 
</center>

<h2>I. Scope & Functionality</h2>
This program's purpose is to read a specified file and create a visual flowchart-like tree to demonstrate course pre/co-requisites. It should include the following:

<ol type="A">
    <li>Parsing code for the aforementioned file</li>
    <li>A website to display the flowchart</li>
    <li>An easy means for the catalog files to be updated</li>
</ol>

At the moment, there are no plans to extend this tool to work for all catalogs. Currently, Dr. Berry only desires catalog information for CS, CE, and EE majors.

<h2 class="nounder">II. Implementation</h2>

<h3>A. Parsing Code</h3>

As part of the website, in JavaScript, parsing code should take in a JSON-formatted file and render a directed acyclic graph ("DAG") from it. There should be multiple input files, separated by both catalog year and major for simplicity's sake. For the 2023 CS catalog, the file should be uniquely named something like `cs_2023.json`. Furthermore, it should follow a scaffolding like:

```json
{
    "nodes": {
        "cosc101": {
            "hours": "3",
            "title": "COSC 101 - Introduction to Programming",
        },
        "cosc102": {
            "hours": "4",
            "title": "COSC 102 - Introduction to Computer Science",
        },
        "math141": {
            "hours": "4",
            "title": "MATH 141 - Calculus I",
        }
    },
    "edges": {
        "prerequisites": [
            ["cosc101, cosc102"]
        ],
        "corequisites": [
            ["cosc101", "math141"]
        ]
    }
}
```

This JSON file should be later extended to support class options (e.g., term 2 of CS 2023 can take MATH132 OR MATH141 OR MATH147). When defining "prerequisite" edges, the edge should list the courses in the order taken (e.g. CS101 comes before CS102, so list CS101 first). Defining "corequisite" edges is less picky, as the edge doesn't have to be directed.

The "title" field is what will be displayed to the user, so make it as user-friendly as possible. The key name (such as "cosc101") will only ever be internal, and should just ensure that it is somehow unique.

<h3>B. The Website</h3>

The website should render an easy-to-read flowchart, with drop-downs at the top of the website to select a catalog year and major.

#### Flowchart

The flowchart should be easily navigable and readable. Ideally, a tiered structure should get rendered such that classes with a pre-requisite have their pre-requisite on the row above them. Further, classes that are co-requisites should share a row if possible. The edges connecting nodes should be initially faint, but somehow highlight when either node is hovered over. Pre-requisite edges should be a directed arrow (->) and co-requisite courses should be a two-way arrow (<->).

#### Drop-down menus

The drop-down menus at the top of the website should auto-populate their options based on the JSON files available to the website. For example, if the website sees `cs_2023.json` available, the 2023 catalog year and the CS major should be available. A catalog year should be selected first, then a major.

#### Interactivity

Clicking on a node should toggle its "complete"-ness, indicating that a student has those credits to aid in visualizing their path.

<h3>C. Catalog Updates</h3>

To add new catalog years, someone should manually fill out a new JSON file for each major path and place them in the appropriate directory.

In the rare occasion that a completed catalog needs to be changed, the JSON file should be accessible for modification. Of course, somebody with familiarity with both JSON and graph data structures can very easily manually modify these files. However, it's possible that somebody in the business or advising offices that _isn't_ familiar with these things will want to make changes. Therefore, the site should somehow provide a way for these users to log in and use some sort of visual editor for these tables.
