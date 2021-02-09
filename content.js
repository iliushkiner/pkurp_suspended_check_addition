var timeout = 30000;
var Suspended_Nums = {"suspended_nums":{}};
var indexeddb = {
  server: 'pkurp-suspended',
  version: 1,
  schema: {
    reassigns: {
      key: { keyPath: 'id', autoIncrement: true },
      // Optionally add indexes
      indexes: {
        appealNumber: { },
      }
    }
  }
};

async function getLocalStorageValue(name){
    return new Promise(resolve => {
      chrome.storage.local.get(name, data=> {
        resolve(data);
      });
    });
}
(async() => {
    let tmptimeout = await getLocalStorageValue('plg_psca_timeout');
    timeout = (Object.values(tmptimeout).length>0 ? parseInt(Object.values(tmptimeout)[0]) : timeout);
    console.log("timeout:",timeout);
    let tmpSuspended_Nums = await getLocalStorageValue('suspended_nums');
    Suspended_Nums = (typeof(tmpSuspended_Nums.suspended_nums) != "undefined" ? tmpSuspended_Nums : Suspended_Nums);
    chrome.runtime.sendMessage({action: 'RefreshIcon'});

  
setInterval(function (){
    /*function postAjaxData(url, json){
      var result = "";
      $.ajax({
        url: url,
        dataType: "json",
        data: JSON.stringify(json),
        method: "POST",
        contentType: "application/json;charset=UTF-8",
        async: false,
        success: function(data) {
          //console.log(data);
          result = data;
        } 
      });
      return result
    }*/
    
    function getAjaxDataPKURP(Suspended_Nums, suspended_num, url){
        //var result = ""; //возврат при неасинхронном запуске
        
        $.ajax({
            url: url,
            dataType: "html",
            method: "GET",
            contentType: "text/html; charset=utf-8",
            async: true,
            success: function(data) {
                //result = data; //возврат при неасинхронном запуске
                //console.log(data);
                //<input class="js-autofill-element" type="checkbox" style="display: none; margin-right: 5px;" data-fields="{&quot;_type&quot;:&quot;RegistryData::DocumentRequisites&quot;,&quot;document_code&quot;:[&quot;558610800000&quot;,{&quot;value&quot;:&quot;Дополнительные документы, представляемые заявителем, в том числе с целью устранения причин, приведших к приостановлению государственного кадастрового учета и (или) государственной регистрации прав (статья 29 Закона)&quot;}],&quot;document_name&quot;:&quot;Дополнительные документы, представляемые заявителем, в том числе с целью устранения причин, приведших к приостановлению государственного кадастрового учета и (или) государственной регистрации прав (статья 29 Закона)&quot;,&quot;document_number&quot;:&quot;КУВД-001/2021-3670443&quot;,&quot;document_date&quot;:&quot;2021-02-03T00:00:00Z&quot;}" data-doc-id="af6c809b-0f79-488a-af38-24f766caff5f" data-doc-type="subprimary" data-subrequest-id="PKPVDMFC-2021-02-03-419758">                    
                let regexp = new RegExp('<input class="js-autofill-element" type="checkbox" style="display: none; margin-right: 5px;" data-fields="(.+?)" data-doc-id=".+?" data-doc-type="subprimary" data-subrequest-id=".+?">','gi');
                //let match = data.matchAll(patern);
                let saved = true;                
                while ((matches = regexp.exec(data)) !== null) {
                    //console.log(`Found ${matches}. Next starts at ${regexp.lastIndex}.`);
                    //console.log(matches[1]);  
                    valid_data = matches[1].replace(/&quot;/g, '"');
                    let doc_data = JSON.parse(valid_data);
                    console.log(doc_data);
                    //Suspended_Nums = {"suspended_nums": [{"appealNum" : appealNum, document_number : []}]};
                    
                    if (typeof(doc_data.document_code) != "undefined" && doc_data.document_code != null && typeof(doc_data.document_code[0]) != "undefined" && doc_data.document_code[0] == "558610800000"){
                        if(suspended_num.document_number.indexOf(doc_data.document_number)<0){
                            suspended_num.document_number.push(doc_data.document_number);
                            suspended_num.visited = false;
                            saved = false;
                        }
                    }
                }                
                if (!saved){
                    console.log(Suspended_Nums);
                    chrome.runtime.sendMessage({action: 'Update_Suspended_Nums',suspended_nums: Suspended_Nums.suspended_nums}
                        //, function(response){console.log(response.farewell);}
                    );
                    //chrome.storage.local.set(Suspended_Nums);
                    chrome.runtime.sendMessage({action: 'RefreshIcon'});
                }
            } 
        });
        //return result //возврат при неасинхронном запуске
    }    
    
    function getAjaxData(url){
        //var result = ""; //возврат при неасинхронном запуске
        $.ajax({
            url: url,
            dataType: "html",
            method: "GET",
            contentType: "text/html; charset=utf-8",
            async: true,
            success: function(data) {
                //result = data; //возврат при неасинхронном запуске
                //console.log(data);
                let regexp = new RegExp('<div class="claims-list-collapse .+?" data-id="(.+?)">','gi');
                //let match = data.matchAll(patern);
                while ((matches = regexp.exec(data)) !== null) {
                    //console.log(`Found ${matches}. Next starts at ${regexp.lastIndex}.`);
                    console.log(matches[1]);
                    //http://pkurp-app-balancer-01.prod.egrn/00/requests/PKPVDMFC-2021-01-28-548444/documents?_id=PKPVDMFC-2021-01-28-548444                    
                    let appealNum = matches[1];//"PKPVDMFC-2021-01-28-548444";
                    let suspended_num = Suspended_Nums.suspended_nums[appealNum];
                    if (typeof(suspended_num) == "undefined"){
                        //reassigned_today.set(reassignReg, {"count": r.length, "percent": reassigned_today.get(reassignReg).percent, "limit": reassigned_today.get(reassignReg).limit});
                        suspended_num = {"document_number" : [], "visited" : false, "actual" : true};
                        Suspended_Nums.suspended_nums[appealNum] = suspended_num;
                        //Suspended_Nums = {"suspended_nums": [appealNum: {document_number : []}]};
                    } else {
                        Suspended_Nums.suspended_nums[appealNum].actual = true;
                    }
                    let url = "http://pkurp-app-balancer-01.prod.egrn/00/requests/"+appealNum+"/documents?_id=" + appealNum;
                    getAjaxDataPKURP(Suspended_Nums, suspended_num, url);                    
                }
                console.log("---------------------------------------------")
                regexp = new RegExp('<ul class="pager">(.+?)</ul>','gi');
                while ((matches = regexp.exec(data)) !== null) {
                    //console.log(`Found ${matches}. Next starts at ${regexp.lastIndex}.`);*/
                    //console.log(matches[1]);
                    let regexpnext = new RegExp('<a rel="next" href="(.+?)">\\d+<\\/a>','gi');
                    let regexpb = new RegExp('<a rel="next" href="(.+?)">\\d+<\\/a>','gi');
                    
                    if((matchesb = regexpb.exec(matches[1])) === null){
                        /**
                        * Чистим лишние из списка
                        */
                        $.each(Suspended_Nums.suspended_nums, function(appeal_Nums,suspended_num){ 
                            if(suspended_num.actual === false){
                                delete Suspended_Nums.suspended_nums[appeal_Nums];
                            }
                        });
                    }
                    
                    while ((matchesnext = regexpnext.exec(matches[1])) !== null) {
                        console.log(matchesnext[1]);
                        getAjaxData(matchesnext[1]);                       
                    }
                }
            } 
        });
        //return result //возврат при неасинхронном запуске
    }
    /**
     * Test na obr PKPVDMFC-2021-01-28-548444
     */
    /*if(document.webkitVisibilityState == 'visible'){      
        //let url = "http://pkurp-app-balancer-01.prod.egrn/00/requests/PKPVDMFC-2021-01-28-548444/documents?_id=PKPVDMFC-2021-01-28-548444";
        let appealNum = "PKPVDMFC-2021-01-28-548444";
        let suspended_num = Suspended_Nums.suspended_nums[appealNum];
        if (typeof(suspended_num) == "undefined"){
            //reassigned_today.set(reassignReg, {"count": r.length, "percent": reassigned_today.get(reassignReg).percent, "limit": reassigned_today.get(reassignReg).limit});
            suspended_num = {"document_number" : [], "visited" : false};
            Suspended_Nums.suspended_nums[appealNum] = suspended_num;
            //Suspended_Nums = {"suspended_nums": [appealNum: {document_number : []}]};
        }
        let url = "http://pkurp-app-balancer-01.prod.egrn/00/requests/"+appealNum+"/documents?_id=" + appealNum;
        getAjaxDataPKURP(Suspended_Nums, suspended_num, url);
    }*/
    if(document.webkitVisibilityState == 'visible'){        
        /**
         * отмечаем все как неактульные
         */
        $.each(Suspended_Nums.suspended_nums, function(appeal_Nums,suspended_num){ 
            suspended_num.actual = false;
        });
        /**
         * Ищем приостановленные обращения
         */
        getAjaxData("http://pkurp-app-balancer-01.prod.egrn/requests?filter=suspended");
    }    
}, timeout);    
})();