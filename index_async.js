const axios = require('axios').default;

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    const accessToken = req.headers['authtoken'];
    const projectId = req.headers['projectid'];
    const buildId = req.headers['buildid'];
    const taskinstanceId = req.headers['taskinstanceid'];
    const jobId = req.headers['jobid'];
    const planUrl = req.headers['planurl'];
    const hubname = req.headers['hubname'];
    const planId = req.headers['planid'];

    context.res = {
    };

    checkTimeline(accessToken, projectId, buildId, taskinstanceId, jobId, planUrl, hubname, planId, context);
}

function checkTimeline(accessToken, projectId, buildId, taskinstanceId, jobId, planUrl, hubname, planId, context){
    const taskIdToCheckFor = "d9bafed4-0b18-4f58-968d-86655b4d2ce9";

    const url = `${planUrl}${projectId}/_apis/build/builds/${buildId}/timeline`;
    console.log(`URL ${url}`);

    const headers = {
        'Authorization':  `bearer ${accessToken}`
    };
    axios({
        url: url,
        headers: headers
    }).then(response => {
        const tasks = response.data.records.filter(record => record.type == "Task" && record.task);
        if (tasks && tasks.find(record => record.task.id == taskIdToCheckFor)) {
            sendOK(projectId, taskinstanceId, jobId, planUrl, hubname, planId);
        } else {
            sendNOK(projectId, taskinstanceId, jobId, planUrl, hubname, planId);
        }
    }).catch(function (error) {
        console.log(error);
    });
}

function sendOK(projectId, taskinstanceId, jobId, planUrl, hubname, planId) {
    console.log('Sending OK');
    const body = {
        name: 'TaskCompleted',
        result: 'succeeded',
        taskId: taskinstanceId,
        jobId: jobId
    }
    sendResponse(body, projectId, planUrl, hubname, planId);
}

function sendNOK(projectId, taskinstanceId, jobId, planUrl, hubname, planId) {
    console.log('Sending NOK');
    const body = {
        name: 'TaskCompleted',
        result: 'failed',
        taskId: taskinstanceId,
        jobId: jobId
    }
    sendResponse(body, projectId, planUrl, hubname, planId);
}

function sendResponse(body, projectId, planUrl, hubname, planId) {
    setTimeout((_ => {
        const url = `${planUrl}${projectId}/_apis/distributedtask/hubs/${hubname}/plans/${planId}/events`;
        console.log(url);
        axios.post(url, body).then(response => console.log(`Callback done ${response.status}`));
    }), 1000);
}
