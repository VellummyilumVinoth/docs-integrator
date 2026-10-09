---
title: Start a Workflow
---

# Start a Workflow

Workflows usually start from your own integration logic, but during testing, onboarding, and day-to-day operations it is useful to launch one by hand. The Integration Control Plane can start any workflow the runtime advertises and builds the input form for you from the workflow's input type, so you do not have to hand-write JSON.

:::info Prerequisites

- A runtime registered with workflow management enabled ([Getting started](manage-workflows.md))
- The `workflow_mgt:manage_workflows` permission on the project or integration

## Where to start a workflow

1. Select **Start New Workflow**. The button is available in two places:

   - Select **Overview** in the console navigation, and then select **Start New Workflow** on the card for the environment where you want to run the workflow.
   - Select **Workflows** in the console navigation, and then select **Start New Workflow**.

2. The **Start Workflow** form opens.

3. In the **Workflow Name** field, select the workflow you want to run. The list shows the workflow definitions available in the current integration.

4. After you select a workflow, the input form for that workflow appears in the dialog.

<ThemedImage
    alt="Workflow input form showing field validation"
    sources={{
        light: useBaseUrl('/img/workflows/icp/workflow-input-validation.png'),
        dark: useBaseUrl('/img/workflows/icp/workflow-input-validation.png'),
    }}
/>

5. The form is validated according to the workflow input type. Required fields are marked with an asterisk.

6. Enter the values for the fields shown in the form. If the workflow defines additional options, they can appear under **Advanced**.

7. Click **Start** to launch the workflow. After you click **Start**, the console shows a confirmation message with the workflow name and the generated workflow ID. You can then:

   - **Copy Workflow ID** puts the ID on your clipboard, which is useful for correlating logs.
   - **View Running Workflow** opens the **Workflow Executions** tab filtered to that ID.
   - **Close** returns to the list.

8. The workflow starts and appears in the **Workflow Executions** list with a status such as **Running**. You can then inspect the execution, monitor its progress, and review activity details.

<ThemedImage
    alt="Starting a workflow from the Workflow Executions page and confirming the workflow ID before viewing the running workflow"
    sources={{
        light: useBaseUrl('/img/workflows/icp/start-workflow.gif'),
        dark: useBaseUrl('/img/workflows/icp/start-workflow.gif'),
    }}
/>

## What's next

- [Workflow executions](workflow-executions.md) — monitor workflow runs and inspect their status
- [Complete human tasks](complete-human-tasks.md) — handle task-based approvals or actions
- [Activities](../../develop-and-test/integration-artifacts/workflow/durable-workflow/activities.md) — review the steps recorded during workflow execution
