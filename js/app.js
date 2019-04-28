/**
	@author: ilyas mimouni (mimouni@outlook.com)
	
	@version: 1.0.0
	
	@date_created: 04/28/2019 18:53:00
	
	@description: 
		This code chanlenge is only a demo development version.
		
		- User should be able to list the most starred Github repos that were created in the last 30 days.
		- User should see the results as a list. One repository per row.
		- User should be able to see for each repo/row the following details :
			Repository name
			Repository description
			Number of stars for the repo.
			Number of issues for the repo.
			Username and avatar of the owner.
		- User should be able to keep scrolling and new results should appear (pagination).

	@limitations:
		* compatibility of ES7 with browsers.
		* can be optimized by a lazy loading of images.
				
*/

class ReposManager {
	constructor(){
		/**
			first initialization
		*/
		this.url_api 		= 'https://api.github.com/search/repositories?q=created:>{last_date}&sort={sort}&order={order}&page={page}';
		this.page 		    = 1;
		this.days      	    = 30;
		this.sort			= 'stars';
		this.order			= 'desc',
		this.row_template	= $('.template').html();
		
		this.loading_locked = false;
		this.loading_error  = false;
		
		console.log('Date - '+ this.days +'days : '+ this.last_date);
		
		this.infiniteScroll();
	}
	
	get last_date(){ 
		/**
			@return: a date  = the current date - x days
		*/
		var date = new Date();
		date.setDate(date.getDate() - this.days);
		
		return date.toISOString().split('T')[0];
	}
	
	get_diff_days(date) { 
		/**
			@date:   an old date 
			@return: number of days between the current date and date1
		*/
		let dt1 = new Date(date);
		let dt2 = new Date();
		return Math.floor((dt2 - Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate()) ) /(1000 * 3600 * 24));
	}
	
	get url_api(){
		return this.build_data(this.url_raw, {
			last_date : this.last_date , 
			order	  : this.order,
			sort 	  : this.sort,
			page 	  : this.page
		});
	}
	
	set url_api(url_with_paramaters){
		this.url_raw = url_with_paramaters; 
	}
	
	build_data(template, obj){
		var s = template;
		for(var prop in obj) {
			s = s.replace(new RegExp('{'+ prop +'}','g'), obj[prop]);
		}
		return s;
	}
	
	async load_data(){
		if(this.loading_locked){ return; }  //prevent from multiple calls to loading data
		
		$('.loading').show();				//show loading image
		this.loading_locked = true;			//add a lock while loading process...
		
		let response = await fetch( this.url_api );
		
		if (response.status !== 200) { 
			this.loading_locked = false;
			return; 
		}
		
		const result = await response.json();
		
		//append the new result in our list :
		for(let item of result.items){
			
			let row = this.build_data(this.row_template, {
				avatar_url		 : item.owner.avatar_url,
				name			 : item.name,
				description		 : item.description,
				stargazers_count : item.stargazers_count,
				open_issues_count: item.open_issues_count,
				days 			 : this.get_diff_days(item.created_at), //pushed_at
				login			 : item.owner.login
			});
			
			$('#app').append(row);
		}
		//when the process of loading is done we unlock the function for the next calls:
		this.loading_locked = false;
		this.page++;
		$('.loading').hide();
	}
	
	infiniteScroll() {	
		let deviceAgent = navigator.userAgent.toLowerCase();
		let agentID = deviceAgent.match(/(iphone|ipod|ipad)/); // check if it's an iPhone, iPod or iPad
		let self = this;
		
		// a function is triggered when the user uses his wheel
		$(window).scroll(function() {      
			// this condition is true when the visitor reaches the footer
			// if it's an iDevice, the event is fired 150px before the footer
			
			if(($(window).scrollTop() + $(window).height()) == $(document).height()
				|| agentID && ($(window).scrollTop() + $(window).height()) + 150 > $(document).height()) {
				// we do our treatments :
				self.load_data();
			}
		});
	}
}

let repos = new ReposManager();

repos.load_data();
