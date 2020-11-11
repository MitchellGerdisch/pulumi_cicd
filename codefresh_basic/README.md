# Pulumi CI/CD Pipeline Demo

Pulumi is an infrastructure as code (IaC) platform that can be integrated with, among other things, CI/CD pipelines.
This repo provides a demo of integrating with a CI/CD tool to deploy a simple static web site in AWS S3.
Of course, Pulumi can be used to stand up any sort of system from infratructure to serverless to kubernetes, etc.

This is a "basic" use-case that is showing the fundamentals of both Pulumi and Codefresh.

# Codefresh CI/CD Platform

This demo uses codefresh.io as the CI/CD platform.

# Demo Notes

## What the Demo is Doing

- User commits code to github repo.
- CI/CD platform clones git repo and creates a pulumi environment and runs pulumi commands as per the Codefresh YAML file in the git repo.
- Pulumi stands up and configures the infrastructure as per the "index.ts" file in the repo.

## Demo Flow

The demo takes about 1.5 minutes to run from commit until the "staging" environment is up and running.

- Modify the "www/index.html" file in the repo to change the "Hello World" type of text.
- Save and commit the change.
- In Codefresh see the new build kick off, select it and select the Output screen to watch the steps
  - You can note how Codefresh Projects are being mapped to Pulumi Organizations,
  - and Codefresh Pipelines are being mapped to Pulumi Stacks (cleanup notwithstanding)
- In Pulumi, see the stack once it gets to the point of deploying the system
  - Navigate the various views and outputs.
  - Once complete, look at the stack Outputs and click on the link to the website to show the change was pushed out.
- An "approval" prompt will be presented in Codefresh asking whether or not to "promote to Production."
  - Select "Approve" to launch a separate `production` stack.
  - Select "Deny" to avoid launching the `production` stack.
  - If you do not make a selection, it will not be promoted to production and the staging stack will be destroyed after an hour or two.
- If Approve was selected, the `production` pipeline will run and the `production` stack will be stood up.
- Another "approval" prompt will be presented in the staging pipeline.
  - Any response will result in both the `staging` and `production` stacks to be destroyed and cleaned up.
  - If you do not respond, the two stacks will be destroyed after an hour or so.

# Setup

## Github

- git clone this repo into your own git repo if needed.

## AWS Setup

- Generate AWS credentials. These are used by the Pulumi CLI that Codefresh runs to stand up the infrastructure.
  - AWS_ACCESS_KEY_ID
  - AWS_SECRET_ACCESS_KEY

## Pulumi Setup

- If necessary, create a free Pulumi account
- Generate an access token. This will be used by Pulumi (see codefresh setup below) to connect to the Pulumi service.
  - Go to https://app.pulumi.com/YOUR_ACCOUNT/settings/tokens

## Codefresh Setup

Notes about Codefresh and Pulumi constructs.

- Codefresh has constructs: projects and pipelines (and builds).
- Pulumi has constructs: organizations, projects, and stacks.
- Codefresh projects map well to Pulumi projects.
- Codefresh pipelines map well to Pulumi stacks.

### Codefresh Project Setup

- Create a project with the name of you want to use for the Pulumi project.
- From the project view select Variables to create the following project variables:
  - PULUMI_ACCESS_TOKEN = value from Pulumi Setup step above
  - PULUMI_ORG = Pulumi organization to which you want to deploy the infrastructure
  - AWS_ACCESS_KEY_ID = value from AWS Setup step above
  - AWS_SECRET_ACCESS_KEY = value from AWS Setup step above

### Main Demo Pipeline(s)

- Create a "staging" pipeline
  - Name: `staging` to represent a staging pipeline (and by extension a "staging" stack in Pulumi), for example.
  - Connect to the git repo you are using.
- From the Workflow view, select the Triggers tab on the right side of the screen.
  - Edit the Git trigger by clicking the pencil icon.
  - Go to the Branch field and deselect the Regex Input slider and then select the specific branch you are using.
    - This configuration is based on the approach being taken in this repo where there is a single repo and different branches to demonstrate different CI/CD integrations. Therefore, we point to the "codefresh demo" branch here.
  - Click Update
- Change the WORKFLOW from inline to "Use YAML from Repository"
  - Confirm it has selected the Git repo you are using.
  - In the Branch field, select the branch you are using.
  - Change the default "PATH TO YAML" to point at the `codefresh.yml`
  - Click Save
- Clone the staging pipeline and call it `production`
  - Click NEXT - copy Workflow
  - SKIP - the Triggers configuration.
  - SKIP - copy variables
  - OPTIONAL: if you don't expect to change codefresh.yml for staging, you can skip this.
    - In WORKFLOW settings, change to use YAML from repository and point it at the same YAML staging points at.
    - Click SAVE
