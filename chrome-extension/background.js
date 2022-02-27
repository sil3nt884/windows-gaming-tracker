let color = '#3aa757';


( async () => {
    chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
        if (changeInfo.status == 'complete') {
            const { url } = tab
            fetch("http://localhost:3001", {
                method : "POST",
                headers: {
                    'content-type': 'application/json'
                },
                body : JSON.stringify({url})
            }).catch(console.log)

        }
    })

})()
