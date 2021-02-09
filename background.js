/*chrome.browserAction.onClicked.addListener(function(tab){
  chrome.tabs.executeScript(tab.id, {
    code: "(" + refreshPopaup.toString() + ")();"
  });  
});

var refreshPopaup = function(){
  let podrazc = 'пусто';
  podrazc = chrome.storage.local.get(['podrazdelenie'], function(result){
    console.log(result.podrazdelenie);
  });

  $("#statistic").html("Подразделение: ".concat(podrazc));
}*/

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse){
    console.log("request",request);
    console.log("sender",sender);
    console.log("sendResponse",sendResponse);
    if (request.action === 'RefreshIcon'){
        let icon = 'normal';
        let suspended_nums = window.localStorage.suspended_nums
        suspended_nums = (typeof(suspended_nums) != "undefined") ? JSON.parse(suspended_nums) : {};
        //for(let suspended_num of suspended_nums){
        $.each(suspended_nums, function(appeal_Nums,suspended_num){ 
            icon = (suspended_num.document_number.length>0 && !suspended_num.visited) ? 'attention' : 'normal';
            return !(icon === 'attention');
        });
        if(icon === 'attention'){
            chrome.browserAction.setIcon({
                path: {
                    "16": "icon16 !.png",
                    "48": "icon48 !.png",
                    "128": "icon128 !.png"
                }
            }); 
        } else {
            chrome.browserAction.setIcon({
                path: {
                    "16": "icon16.png",
                    "48": "icon48.png",
                    "128": "icon128.png"
                }
            });         
        }
    } else if(request.action === 'Update_Suspended_Nums'){
        /*chrome.tabs.query({url: "http://10.128.21.4/app/incidents/new"}, function(tabs){
        console.log(tabs);
        if (tabs.length>0){
            chrome.tabs.sendMessage(tabs[0].id, request//, function(response){console.log(response);}
            );
        }
        });*/
    
        window.localStorage.suspended_nums = JSON.stringify(request.suspended_nums);  
        chrome.storage.local.set({suspended_nums : request.suspended_nums}, function(){
            console.log(request);
        });
    }
});
