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

    checkTimeline(accessToken, projectId, buildId, taskinstanceId, jobId, planUrl, hubname, planId);
}

async function checkTimeline(accessToken, projectId, buildId, taskinstanceId, jobId, planUrl, hubname, planId){
    const taskIdToCheckFor = "d9bafed4-0b18-4f58-968d-86655b4d2ce9";

    const url = `${planUrl}${projectId}/_apis/build/builds/${buildId}/timeline`;

    const headers = {
        'Authorization':  `bearer ${accessToken}`
    };
    axios({
        url: url,
        headers: headers
    }).then(response => {
        const tasks = response.data.records.filter(record => record.type == "Task" && record.task);
        if (tasks && tasks.find(record => record.task.id == taskIdToCheckFor)) {
            sendResponse(accessToken, projectId, taskinstanceId, jobId, planUrl, hubname, planId, 'succeeded');
        } else {
            sendResponse(accessToken, projectId, taskinstanceId, jobId, planUrl, hubname, planId, 'failed');
        }
    }).catch(function (error) {
        console.log(error);
    });
}

function sendResponse(accessToken, projectId, taskinstanceId, jobId, planUrl, hubname, planId, status) {
    const headers = {
        'Authorization':  `bearer ${accessToken}`
    };

    const body = {
        name: 'TaskCompleted',
        result: status,
        taskId: taskinstanceId,
        jobId: jobId
    }

    const url = `${planUrl}${projectId}/_apis/distributedtask/hubs/${hubname}/plans/${planId}/events`;
    axios.post(url, body, { 
        headers: headers,
        params: {
            'api-version': '2.0-preview.1'
        }} ).then(response => {
            console.log(`Callback done ${response.status} ${response.body}`);
        }).catch(error => console.log(error));
}
