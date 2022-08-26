const axios = require('axios').default;

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    const accessToken = req.headers['authtoken'];
    const projectId = req.headers['projectid'];
    const buildId = req.headers['buildid'];
    const planUrl = req.headers['planurl'];

    await checkTimeline(accessToken, projectId, buildId, planUrl, context);
}

async function checkTimeline(accessToken, projectId, buildId, planUrl, context){
    const taskIdToCheckFor = "d9bafed4-0b18-4f58-968d-86655b4d2ce9";

    const url = `${planUrl}${projectId}/_apis/build/builds/${buildId}/timeline`;
    context.log(`URL ${url}`);

    const headers = {
        'Authorization': `bearer ${accessToken}`
    };
    const response = await axios({
        url: url,
        headers: headers
    });

    const tasks = response.data.records.filter(record => record.type == "Task" && record.task);
    if (tasks && tasks.find(record => record.task.id == taskIdToCheckFor)) {
        sendResponse(context, 'successful');
    } else {
        sendResponse(context, 'failed');
    }
}

function sendResponse(context, status) {
    context.res = {
        status: 200,
        body: {
            status: status
        }
    };
    context.log(`Sent ${status}`);
}