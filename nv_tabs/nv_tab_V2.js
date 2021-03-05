function isMobile() {
    var UserAgent = navigator.userAgent;
    if (UserAgent.match(/iPhone|iPod|Android|Windows CE|BlackBerry|Symbian|Windows Phone|webOS|Opera Mini|Opera Mobi|POLARIS|IEMobile|lgtelecom|nokia|SonyEricsson/i) != null || UserAgent.match(/LG|SAMSUNG|Samsung/) != null) {
        return true;
    }
    else {
        return false;
    }
}
/*
    [WARNING]
    This script should be import to last script file.
    This script will not apply to the created element dynamically by script.
    But, If you need the solution for dynamically created content, you can create and remove the tab object manually.
*/

function TabElementCollection (){
    var _this = this;

    this.TABLIST_CONTAINER = document.querySelectorAll('ul,ol'); // Tab controller list must be made by using UL, LI
    this.TABCONTROL_COLLECTION = []; // tabcontroller access array


    this.Initialization = function (){ // create Tab Objects
        var TABLIST = _this.TABLIST_CONTAINER;
        TabListlength = TABLIST.length;
        for( var i = 0; i<TabListlength; i++){
            var element = TABLIST[i];
            _this.TABCONTROL_COLLECTION[i]=new Tab(element);
            if (window.getComputedStyle(element).display === "none") {
                this.removeAttribute("role","aria-controls");
                            }
        }
    }


    // If you'll make the tab dynamically, register the object by using this method.

    this.createTabByManual = function(tablistElement){
        _this.TABCONTROL_COLLECTION.push(new Tab(tablistElement));
    }

    // If you'll remove the made tab dynamically, delete the object by using this method.
    this.removeTabByManual = function(index){
        if( typeof index === 'number' &&
             !isNaN(Number(index)) 
        ){
            var TAB_CONTROL = _this.TABCONTROL_COLLECTION[index];
            if(TAB_CONTROL){
                //mark
                for(var prop in TAB_CONTROL){
                    var c_prop = TAB_CONTROL[prop];
                    if(c_prop instanceof Element){
                        c_prop.parentElement.removeChild(c_prop);
                        if(c_prop.panel){
                            c_prop.panel.parentElement.removeChild(c_prop.panel);
                        }
                    }
                }
                _this.TABCONTROL_COLLECTION.splice(index,index);
            }
        }
    }

    function Tab(CONTAINER){ //TabObjects
        var _this = this;
        _this.TABLIST_CONTAINER = CONTAINER;
        /*
            Tab item must be created according to below structures
            1. li>a[role="tab"]
            2. li>button[role="tab"]
            3. li[role="tab"]
        */
        _this.MODE = _this.TABLIST_CONTAINER.getAttribute('data-mode');
        _this.MODE ? false : _this.TABLIST_CONTAINER.setAttribute('data-mode','aria1.1_click')
        _this.TABLIST_ITEMS = _this.TABLIST_CONTAINER.querySelectorAll('li[role=tab],a[role="tab"],button[role="tab"]');
        _this.ITEMLENGTH = _this.TABLIST_ITEMS.length;
        _this.INDEX_OF_SELECTED_TAB = 0;
        _this.IS_VERTICAL_TAB = _this.TABLIST_CONTAINER.getAttribute('aria-orientation') === 'vertical';
        _this.DEFAULT_SELECTED_TAB = _this.TABLIST_CONTAINER.querySelector('[aria-selected=true]');
        Object.defineProperties(_this,{
            "select":{
                set(i){//Is the Setter property for tab select interface
                    if(
                        ( typeof i === 'number' )
                        ||
                        ( (typeof i === 'string') && !isNaN(Number(i)) )
                    ){
                        _this.INDEX_OF_SELECTED_TAB = Number(i);

                        for(var cnt = 0; cnt<_this.ITEMLENGTH; cnt++){
                            var e = _this.TABLIST_ITEMS[cnt];
                            var forA11y = e.querySelector('.for-a11y');
                            e.panel = e.getAttribute('aria-controls')  ? document.getElementById(e.getAttribute('aria-controls')) : null;
                            if(e.panel){
                                e.panel.setAttribute('role','tabpanel');
                                if(!isMobile()){
                                    e.panel.setAttribute('tabindex','0');
                                }
                                if(e.hasAttribute('aria-label')){
                                    e.panel.setAttribute('aria-label',e.getAttribute('aria-label'))
                                }
                                
                                if( (!e.panel.hasAttribute('aria-label') && !e.innerText.length <= 0) ){
                                    if(forA11y){
                                        e.panel.setAttribute('aria-label',forA11y.innerText);
                                    }
                                }

                                if( !e.panel.contains(document.querySelector('.material-icons')) && e.innerText.length > 0 ){
                                    e.panel.setAttribute('aria-label',e.innerText);
                                }
                            }
                        

                            if( e === _this.TABLIST_ITEMS[i] ){
                                e.setAttribute('tabindex','0');
                                e.setAttribute('aria-selected','true');
                                e.panel ? e.panel.classList.remove('hide')
                                : false;
                            }else{
                                e.setAttribute('tabindex','-1');
                                e.setAttribute('aria-selected','false');
                                e.panel ? e.panel.classList.add('hide') :
                                false;
                            }
                        }
                    }
                },
                get(){
                    //The Getter property for getting selected tab's index value
                    return _this.INDEX_OF_SELECTED_TAB;
                }
            }
        })

        function setInitAndLoad(){// creation function
            /*
            if you want to set a tab element of the specific index by default, please put aria-selected="true" attribute to the tab element that you want to set in your HTML file.

            you've not to set the default tab necessarily, If you didn't set a default tab, the first tab will be selected by default.

            And if you set the aria-selected = "true" at the two tab element, default tab will be set to last aria-selected="true" element.
            */
            _this.select = _this.DEFAULT_SELECTED_TAB ? Array.prototype.indexOf.call(_this.TABLIST_ITEMS,_this.DEFAULT_SELECTED_TAB) :  0; // select init
            for(var i=0; i<_this.ITEMLENGTH; i++){
                //TabItem for-Statement
                var e = _this.TABLIST_ITEMS[i];

                // response condition, case: role = "tab" element is nested in li container
                if( e.parentElement instanceof HTMLLIElement ){
                    e.parentElement.setAttribute('role','none');
                }

                e.addEventListener('click',function(){ // Event for mouse left-click to select
                    
                    var idx = Array.prototype.indexOf.call(_this.TABLIST_ITEMS,this);
                    //get index of tab items

                    _this.select = idx //select tab by refer the clicked tab item index
                });
                e.addEventListener('keydown',function(e){//Event for switch Tabs by press arrow, Home End keys.

                    var keySTR = e.code;//key value for switch statement
                    /*
                        you must not need to define an aria-orientation attribute when creating the horizontal tab controls.
                        But, if you want to define it for semantic mark-up, you can use the "horizontal" value.
                    */
                    var Next = _this.IS_VERTICAL_TAB ? 'ArrowDown' : 'ArrowRight'
                    var Prev = _this.IS_VERTICAL_TAB ? 'ArrowUp' : 'ArrowLeft'
                    var Home = 'Home';
                    var End = 'End';
                    var FocusingIndex = Array.prototype.indexOf.call(_this.TABLIST_ITEMS,this);
                    switch (keySTR){
                        case Next:
                            if(_this.TABLIST_CONTAINER.getAttribute('data-mode') === 'aria1.1'){
                                if( _this.select < _this.ITEMLENGTH-1 ){
                                    _this.select = (_this.select+1);//Select Next Tab Element of the Selected Current Tab
                                    _this.TABLIST_ITEMS[_this.select].focus();
                                }else{
                                    _this.select = 0;
                                    _this.TABLIST_ITEMS[_this.select].focus();
                                }
                            }
        
                                
                            if(_this.TABLIST_CONTAINER.getAttribute('data-mode') === 'aria1.1_click'){
                                if( _this.select < _this.ITEMLENGTH-1 ){
                                    _this.TABLIST_ITEMS[_this.select+1].click();//Select Next Tab Element of the Selected Current Tab                                                                                
                                    _this.TABLIST_ITEMS[_this.select].focus();
                                }else{
                                    _this.TABLIST_ITEMS[0].click();//Select Next Tab Element of the Selected Current Tab                                                                                
                                    _this.TABLIST_ITEMS[_this.select].focus();
                                }
                            }
                                
                            if(_this.TABLIST_CONTAINER.getAttribute('data-mode') === 'aria1.2'){
                                if(FocusingIndex < _this.ITEMLENGTH-1 ){
                                    _this.TABLIST_ITEMS[FocusingIndex+1].focus();
                                }
                                if( !_this.TABLIST_ITEMS[FocusingIndex+1] ){
                                    _this.TABLIST_ITEMS[0].focus();
                                }
                            }

                        break;

                        case Prev:
                            if( _this.TABLIST_CONTAINER.getAttribute('data-mode') === 'aria1.1'){
                                if(_this.select > 0){
                                    _this.select = (_this.select-1);//Select Previous Tab Element of the Selected Current Tab
                                }else{
                                    _this.select = _this.ITEMLENGTH-1;
                                }
                                _this.TABLIST_ITEMS[_this.select].focus();
                            }
                            
                            if(_this.TABLIST_CONTAINER.getAttribute('data-mode') === 'aria1.1_click'){
                                if(_this.select > 0){
                                    _this.TABLIST_ITEMS[_this.select-1].click();//Select Previous Tab Element of the Selected Current Tab
                                    _this.TABLIST_ITEMS[_this.select].focus();
                                }else{
                                    _this.TABLIST_ITEMS[_this.ITEMLENGTH-1].click();
                                    _this.TABLIST_ITEMS[_this.select].focus();
                                }
                            }
                            
                            if(_this.TABLIST_CONTAINER.getAttribute('data-mode') === 'aria1.2'){
                                if(FocusingIndex > 0){
                                    _this.TABLIST_ITEMS[FocusingIndex-1].focus();//Select Previous Tab Element of the Selected Current Tab
                                }
                                if(!_this.TABLIST_ITEMS[FocusingIndex-1]){
                                    this.TABLIST_ITEMS[_this.ITEMLENGTH-1].focus();
                                }
                            }

                        break;

                        case 'Enter':
                            if(_this.TABLIST_CONTAINER.getAttribute('data-mode') === 'aria1.2'){
                                this.click();
                            }
                            break;
                        case 'Space':
                            if(_this.TABLIST_CONTAINER.getAttribute('data-mode') === 'aria1.2'){
                                this.click();
                            }
                            break;

                        case Home:
                            if(_this.TABLIST_CONTAINER.getAttribute('data-mode') === 'aria1.1'){
                                _this.select = 0;//Select First Tab Element
                                _this.TABLIST_ITEMS[_this.select].focus();
                            }else if(_this.TABLIST_CONTAINER.getAttribute('data-mode') === 'aria1.1_click'){
                                _this.TABLIST_ITEMS[0].click();
                                _this.TABLIST_ITEMS[0].focus();
                            }else if(_this.TABLIST_CONTAINER.getAttribute('data-mode') === 'aria1.2'){
                                _this.TABLIST_ITEMS[0].focus();
                            }
                        break;

                        case End:
                            if(_this.TABLIST_CONTAINER.getAttribute('data-mode') === 'aria1.1'){
                                _this.select = _this.ITEMLENGTH-1;//Select Last Tab Element
                                _this.TABLIST_ITEMS[_this.select].focus();
                            }else if(_this.TABLIST_CONTAINER.getAttribute('data-mode') === 'aria1.1_click'){
                                _this.TABLIST_ITEMS[_this.ITEMLENGTH-1].click();
                                _this.TABLIST_ITEMS[_this.ITEMLENGTH-1].focus();
                            }else if(_this.TABLIST_CONTAINER.getAttribute('data-mode') === 'aria1.2'){
                                _this.TABLIST_ITEMS[_this.ITEMLENGTH-1].focus();
                            }
                        break;
                    }
                })
            }
        }

        setInitAndLoad();// Tab Script Ended
    }
    }

    (function(){//creation tabs automatically that are written by using correct structure pattern on this page

        var TAB = new TabElementCollection();//create object

        TAB.Initialization();//tab creation start(default usage)

        /*
            [READ ME]
            This is an example code for setting the tab object when you make the tab dynamically by using javascript.
            When you use it on your services, Please delete the below code lines that are surrounded by the '<Example>' Mark.
        */
       //<Example START>
        var DynamicCreatedTab =document.createElement('div');
        DynamicCreatedTab.innerHTML+=`
        <div class="DynamicTest_WRAPPER">
        <ul role="tablist">
            <li role="tab" aria-controls="DynamicTabTest1">Tab A</li>
            <li role="tab" aria-controls="DynamicTabTest2">Tab B</li>
            <li role="tab" aria-controls="DynamicTabTest3">Tab C</li>
        </ul>
            <div class="panel-wrapper" data-role="panelList">
                <div id="DynamicTabTest1">
                    Panel A
                </div>
                <div id="DynamicTabTest2">
                    Panel B
                </div>
                <div id="DynamicTabTest3">
                    Panel C
                </div>
            </div>
        </div>
    `;
    document.body.append(DynamicCreatedTab);
    TAB.createTabByManual(document.querySelector('.DynamicTest_WRAPPER [role=tablist]'))
    //</Example END>
    
})();//self calling function for Security