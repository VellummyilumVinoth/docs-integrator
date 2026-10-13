---
title: AI Data Mapping
---

# AI Data Mapping

The AI Data Mapper uses WSO2 Integrator Copilot to generate mappings between data structures, without manual field-by-field matching. It is especially useful for large or complex schemas with many fields, deeply nested records, or domain-specific formats. Copilot uses its `data-map` skill to write the mapping code, then checks that the project compiles before it finishes.

For the Data Mapper editor and manual mapping, see [Data Mapper editor](../../../../editor/designers/data-mapper.md).

## How to use

1. Define the input and output record types in the **Types** panel. Define inner records first, then compose them into the parent input and output records. For details on creating records, see [Type editor](../../../../editor/panels/type-panel.md).

    <ThemedImage
        alt="Types canvas with child record cards visible, and the New Type panel open for defining a parent record that references them"
        sources={{
            light: useBaseUrl('/img/develop/integration-artifacts/supporting/data-mapper/ai-data-mapper-define-personal-profile.png'),
            dark: useBaseUrl('/img/develop/integration-artifacts/supporting/data-mapper/ai-data-mapper-define-personal-profile.png'),
        }}
    />

2. Create the data mapper. Under **Data Mappers** in the project explorer, select **+**. Set a name, add the input type with a parameter name, set the output type, and select **Create**. Select **Add Input** to map from more than one input, and select **Public** to make the data mapper visible across the project.

    <ThemedImage
        alt="Create New Data Mapper form with the data mapper name set to transform, a Public checkbox, a Student input named student with an Add Input option, and PersonalProfile as the output type"
        sources={{
            light: useBaseUrl('/img/develop/integration-artifacts/supporting/data-mapper/ai-data-mapper-create-form.png'),
            dark: useBaseUrl('/img/develop/integration-artifacts/supporting/data-mapper/ai-data-mapper-create-form.png'),
        }}
    />

3. The Data Mapper editor opens with the input schema on the left and the output schema on the right. The toolbar has **Auto Map** and **Configure**, and **Add Sub Mapping** appears below the inputs.

    <ThemedImage
        alt="Data Mapper canvas for the transform function with the Student input on the left, the PersonalProfile output on the right, no mappings, and Auto Map and Configure in the toolbar"
        sources={{
            light: useBaseUrl('/img/develop/integration-artifacts/supporting/data-mapper/ai-data-mapper-canvas.png'),
            dark: useBaseUrl('/img/develop/integration-artifacts/supporting/data-mapper/ai-data-mapper-canvas.png'),
        }}
    />

4. In the top-right corner of the canvas, select **Auto Map**. The WSO2 Integrator Copilot panel opens alongside the canvas with a prompt that uses the `/data-map` skill, for example `/data-map generate mappings for the @transform function`. You can edit the prompt to add business rules, or attach reference documents before you send it. See [Supporting documentation to improve accuracy](#supporting-documentation-to-improve-accuracy).

    :::note
    **Auto Map** is disabled when an input or the output is a generic `json` or `xml` type whose structure isn't defined yet. Add a sample payload first, as described in [Generic type mappings](generic-type-mappings.md), and then select **Auto Map**.
    :::

    <ThemedImage
        alt="WSO2 Integrator Copilot panel open alongside the Data Mapper canvas with the prompt /data-map generate mappings for the @transform function in the input field"
        sources={{
            light: useBaseUrl('/img/develop/integration-artifacts/supporting/data-mapper/ai-data-mapper-copilot-command.png'),
            dark: useBaseUrl('/img/develop/integration-artifacts/supporting/data-mapper/ai-data-mapper-copilot-command.png'),
        }}
    />

5. Send the prompt. Copilot reads the input and output types, writes the mappings into `data_mappings.bal`, and checks the project for compilation errors, fixing any it finds. When it finishes, it lists the field mappings it made, and mapping lines appear between the matched fields on the canvas.

6. Review the result. The **Changes made** panel lists the modified data mapper. Switch between **Diagram** and **Code** to inspect the change, select **Review** to see the diff, or select **Revert** to undo it. To return to the state before this request, select **Restore Checkpoint** at the top of the conversation.

    <ThemedImage
        alt="Data Mapper canvas with generated mapping lines from Student to PersonalProfile, and the Copilot panel showing Using skill: data-map, the list of field mappings, No issues found, and a Changes made panel with Review, Diagram, Code, and Revert"
        sources={{
            light: useBaseUrl('/img/develop/integration-artifacts/supporting/data-mapper/ai-data-mapper-result.png'),
            dark: useBaseUrl('/img/develop/integration-artifacts/supporting/data-mapper/ai-data-mapper-result.png'),
        }}
    />

<h2>Define data types</h2>

Define the input and output record types in `types.bal`:

```ballerina
type Student record {
    int id;
    string studentName;
    int age;
    string gender;
    string[] semesterGPA;
    string academicMajor;
    Student[] roommates;
    string address;
};

type PersonalProfile record {
    int id;
    Bio bio;
    AcademicRecord academicRecord;
    Accommodation accommodationDetails;
};

type Bio record {
    string name;
    string gender;
    int age;
};

type AcademicRecord record {
    string major;
    string[] semesterGPA;
};

type Accommodation record {
    int numberOfRoommates;
    string address;
};
```

<h2>Define the data mapper function</h2>

Define the `transform` function stub in `data_mappings.bal`:

```ballerina
function transform(Student student) returns PersonalProfile => {};
```

Select **Visualize** above the `transform` function to open it in the Data Mapper editor. In the editor, select **Auto Map** to generate the field mappings. The function is updated with the generated implementation:

```ballerina
function transform(Student student) returns PersonalProfile => {
    id: student.id,
    bio: {name: student.studentName, gender: student.gender, age: student.age},
    academicRecord: {major: student.academicMajor, semesterGPA: student.semesterGPA},
    accommodationDetails: {numberOfRoommates: student.roommates.length(), address: student.address}
};
```

### Inline mappings

**Auto Map** also works on inline mappings, for example a **Map Data** node inside a service resource or function, not only on standalone data mappers. In this case, Copilot uses the prompt `/data-map generate mappings using record fields and external values` and writes the mapping as inline field expressions in place, instead of creating a data mapper function.

## Features

### Automated mapping generation

Mapping generation takes into account:

- Field names and naming conventions
- Semantic relationships between fields
- Nested data structures
- Array types and cardinality
- Optional and nullable fields

When it decides how to map each field, Copilot follows this order of priority:

1. Mappings you already defined. Copilot keeps them as they are.
2. Existing sub-mappings.
3. Business rules and context you provide in the prompt or attached documents.
4. Built-in Ballerina functions and standard approaches.
5. Default values, only for required fields that have no match.

### Supported types

The AI Data Mapper generates mappings between records, JSON, XML, arrays, and primitive types, including records imported from other packages. It handles:

- **Optional and nullable fields**: Uses optional field access (`?.`) only where a field is actually optional or nullable.
- **Nested records**: Builds nested output records with record constructors.
- **Array-to-array mappings**: Uses query expressions (`from ... select`) when both the input and output are arrays.
- **Union types and enums**: Generates a helper function for each union or enum, with one function per level of nesting.
- **Parsing and conversion**: Converts values between types, such as parsing a string as an integer.

### Supporting documentation to improve accuracy

Attach reference materials to the Copilot prompt to improve mapping accuracy. While schema-only analysis is supported, providing additional documentation helps Copilot understand field relationships and business rules.

Supported formats:

- PDF documents
- Images (JPEG, JPG, PNG, HEIC, HEIF)
- CSV files
- Plain text files

For complex mapping scenarios involving large schemas or domain-specific requirements captured in multiple documents, attach all of them. Copilot analyzes all the documentation to generate accurate, context-aware transformations.

### Sub-mapping reuse

The AI Data Mapper detects existing sub-mappings and data mappers in your project and reuses them where applicable. This reduces code duplication, keeps transformation logic consistent, and keeps the codebase compact.

### Helper functions for complex logic

Copilot moves logic that can't be written as a simple field expression into separate helper functions, placed before the main transform function. This includes union and enum handling, transformations that need conditionals or loops, and computations reused across several output fields.

### Compilation check

After writing the mappings, Copilot checks the project for compilation errors and fixes them, repeating until the code compiles. The result reports **No issues found** when the mapping compiles cleanly.

## Responsible use

Large language models can produce unexpected results when processing highly domain-specific or atypical schema patterns. Follow these practices to ensure accuracy:

- Review all generated mappings before deploying to production.
- Test with representative data samples that reflect actual use cases.
- Verify that the generated transformation logic aligns with your business requirements.
- Provide feedback on incorrect or incomplete mappings to support continuous improvement.

## What's next

- [Data Mapper editor](../../../../editor/designers/data-mapper.md) — Open, configure, and work with the visual mapping canvas.
- [Data mapper](data-mapper.md) — End-to-end guide to creating and using data mappers.
- [Expression editor](../../../../editor/panels/expression-panel.md) — Write custom expressions for individual field mappings.
