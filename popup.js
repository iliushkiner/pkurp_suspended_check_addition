// JavaScript Document
var Suspended_Nums = {"suspended_nums":{}};

$(document).ready(function(){  
  function load(){ 
    Suspended_Nums = (typeof(window.localStorage.suspended_nums) != "undefined" ? JSON.parse(window.localStorage.suspended_nums) : Suspended_Nums);

    let htm = '<div class="row">';  
    $.each(Suspended_Nums, function(key,suspended_num){
        if((!suspended_num.visited || $('#show_all')[0].checked) && suspended_num.document_number.length>0){
            htm += '<div id="appealnum-' + key + '" class="col-xs-6"><div><a target="_blank" href="http://pkurp-app-balancer-01.prod.egrn/00/requests/' + key + '/documents?_id=' + key + '">' + key + '</a> <input class="visited" data-appealnumber="' + key + '" type="button" value="' + (!suspended_num.visited ? 'отметить' : 'включить') + '"></div></div>';
        }    
    });    
    htm += '</div>';
  
    $('#suspended_nums').html(htm);
  }
  
  load();
  
  $('body').on('click', '.visited', function(){  
    let key = $(this).data('appealnumber');
    Suspended_Nums[key].visited = !Suspended_Nums[key].visited;
    window.localStorage.suspended_nums = JSON.stringify(Suspended_Nums);
    chrome.storage.local.set({suspended_nums : Suspended_Nums}, function(){
            console.log(Suspended_Nums);
    });    
    if (Suspended_Nums[key].visited && !$('#show_all')[0].checked){
        $('#appealnum-'+key).remove();
    }
    $('#appealnum-' + key + ' .visited').val(Suspended_Nums[key].visited ? 'включить' : 'отметить');
    chrome.runtime.sendMessage({action: 'RefreshIcon'});
  });
  
  $('#refresh').on('click', function(){  
      load();
  });
  
  $('#show_all').on('click', function(){  
      load();
  });
});
