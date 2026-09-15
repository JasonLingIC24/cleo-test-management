import fetch from "node-fetch";
import { getConfig } from "./configService.js";

export async function getActiveSprint() {

    const jira = getConfig().jira;

    const auth = Buffer
        .from(`${jira.email}:${jira.token}`)
        .toString("base64");

    const url =
        `${jira.baseUrl}/rest/agile/1.0/board/${jira.boardId}/sprint?state=active`;

    const response = await fetch(url, {
        headers: {
            Authorization: `Basic ${auth}`,
            Accept: "application/json"
        }
    });

    if (!response.ok) {
        throw new Error(
            `Failed to retrieve active sprint (${response.status})`
        );
    }

    const data = await response.json() as any;

    if (!data.values?.length) {
        throw new Error(
            "No active sprint found"
        );
    }

    const sprint = data.values[0];

    console.log(
        `✅ Active Sprint: ${sprint.name}`
    );

    return sprint;
}