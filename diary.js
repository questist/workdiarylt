// JavaScript Document

var diaryIDcount = 0
function diaryItem(timeStamp,description,complete,rating,auto = false) {
	this.timeStamp = timeStamp
	this.description = description
	this.complete = complete
	this.rating = rating
	this.id = diaryIDcount++
	this.isSelected = false
	this.isAuto = auto
}

var startingItem = new diaryItem("Start Time: " + new Date().toDateString(),
						  'Ready for New Entries',
						  'Complete or In-Progress',
						  '1-10 Rating')
var startTime = new Date();
var elapsedTime = { timeString: "Loading...", time: 0 }
var checkInTime = { timeString: "Enter Auto Check In", time: 0 }

function toTimeString(time) {
	var timeString = ""
	if(time <= 59) {
		timeString = time + " Seconds"
	}
	else if(time >= 60 && time < (60 * 60)) {
		var min = Math.floor(time / 60)
		var sec = time - (min * 60)
		timeString = min + " Minutes, "
		timeString += sec + " Seconds"
	}
	else if(time >= (60 * 60)) {
		var hours = Math.floor(time / (60 * 60))
		var min = Math.floor(time/ 60) - (hours * 60)
		var sec = time - (hours * 60 * 60) - (min * 60)
		timeString = hours + " Hours, " + min + " Minutes, "
		timeString += sec + " Seconds"
	}
	return timeString
}

function updateTime() {
	var endTime = new Date()
	var timeDiff = endTime - startTime
	timeDiff /= 1000
	elapsedTime.time = Math.round(timeDiff)
	elapsedTime.timeString = toTimeString(elapsedTime.time);
	setTimeout(updateTime,1000)
}

setTimeout(updateTime,1000);

var myMixin = {
	filters: {
		displayDescription: function(value) {
			if(value.length > 36) {
				return value.slice(0,36) + "<br>" + value.slice(36,value.length)
			}
			else {
				return value
			}
		}
	}
}
Vue.component('counter', {
	props: ['elapsedtime','checkintime'],
	data: function () {
		return {
			startTime: new Date().toLocaleString(),
		}
	},
	methods: {
		displayCheckInTime: function () {
			if(this.checkintime.time === 0) {
				return this.checkintime.timeString
			}
			return toTimeString(this.checkintime.time)
		}
	},
	template: '<div class="counter"><div class="current-time">{{ startTime }}</div><div class="elapsed-time"> {{ elapsedtime.timeString }} </div><div>\
	<span v-if="checkintime.time != 0"> {{ displayCheckInTime() }} </span> <span v-else>Choose Next Auto Check In</span>\
</div></div>'
})

Vue.component('time-stamps', {
	props: ['item'],
	data: function() {
		return {
			selectedItems: []
		}
	},
	//mixins: [myMixin],
	template: '<li :class="{stampSelected: item.isSelected}" @click="$emit(\'selectentry\',item.id)" v-if="item.id !== 0">Entry at: {{item.timeStamp}}<br>Description:<br/>{{item.description }}</li>'
})

Vue.component('diary-item-display', {
	props: ['item'],
	data: function() {
		return {
			description: 'My first item'
		}
	},
	//mixins: myMixin,
	template: '<div>\
		{{item.timeStamp}}<br>\
		{{(item.complete === true)?"Complete":"In-progress"}}<br>\
		{{item.rating}}<br>\
		{{item.description }}<br>\
		</div>'
})

Vue.component('time-select', {
	template: '<div>\
	<label>Hours</label><input id="hours" min="0" value="0" type="number" style="width: 40px" size="2" max="23">\
	<label>Minutes</label><input id="min" min="0" value="0" style="width: 40px;" type="number" size="2" max="59">\
	</div>'
})

Vue.component('diary-item-entry', {
	props: {
		item: diaryItem
	},
	data: function() {
		return {
			checkInChecked: false,
			editing: false
		}
	},
	mounted: function() {
		if(this.item.isAuto === true) {
			this.editing = true
		}
	},
	template: '<div>\
		<h3 v-if="item.isAuto">Edit Auto Entry from<br> {{item.timeStamp}}</h3>\
		<span>How well did you do</span>\
		<select id="entry-rating">\
			<option disabled value="">*</option>\
			<option v-for="n in 10">{{n}}</option>\
		</select><br>\
		<input name="progress" type="radio" id="entry-yes" value="Yes" checked>\
		<label for="yes">Complete</label><br>\
		<input name="progress" type="radio" id="entry-no" value="No">\
		<label for="no">In-Progress</label><br>\
		<label for="entry-description">Diary Entry</label>\
		<input id="entry-description" name="description"><br>\
		<span v-if="item.isAuto === false">\
		<label for="check-in">Set a automatic Checkin Time</label>\
		<input type="checkbox" id="check-in" v-model="checkInChecked"><br>\
		<time-select v-if="checkInChecked"></time-select>\
		</span>\
		<button v-if="item.isAuto === true" @click="$emit(\'editentry\')">Edit Entry</button>\
		<button v-else @click="$emit(\'submitentry\')">Add Entry</button>\
		</div>'
})

var diaryApp = new Vue({
	el: "#app-diary",
	data: {
		/*
		diaryItems: [ 
			new diaryItem("Start Time: " + new Date().toDateString(),
						  'Ready for New Entries',
						  'Complete or In-Progress',
						  '1-10 Rating')
		],*/
		diaryItems: [startingItem],
		isAddEntry: true,
		currentlyDisplayedEntry: startingItem,
		startTime: new Date().toTimeString(),
		lastCheckinTime: new Date(),
		elapsedTime: elapsedTime,
		checkInTime: checkInTime,
		autoCheckInTimeout: null
		/*
		diaryItem: {
			timeStamp: new Date().toDateString(),
			description: "Hello, world",
			complete: false,
			rating: 10
		}*/
	},
	methods: {
		
		updateTime: function() {
			startTime = new Date();
		},
		toggleDisplay: function() {
			this.isAddEntry = (this.isAddEntry === true)? false : true;
		},
		addAutoEntry: function() {
			this.diaryItems.push( new diaryItem(
				new Date().toTimeString(),
				"Auto Entry Click to edit",
				"Was this Completed",
				"Enter a rating",
				true
			))
		},
		editEntry: function() {
				this.currentlyDisplayedEntry.description = document.getElementById("entry-description").value,
				this.currentlyDisplayedEntry.complete = document.getElementById("entry-yes").checked,
				this.currentlyDisplayedEntry.rating = document.getElementById("entry-rating").value + " rating"
				this.currentlyDisplayedEntry.isAuto = false 
		},
		submitEntry: function() {
			if(document.getElementById("check-in").checked === true) {
				var min = document.getElementById("min").value
				var hours = document.getElementById("hours").value
				var seconds = 0;
				if(hours !== 0) {
					seconds += (hours * 60 * 60)
				}
				if(min !== 0) {
					seconds += (min * 60)
				}
				this.checkInTime.time = seconds;
				if(this.autoCheckInTimeout !== null) {
					clearTimeout(this.autoCheckInTimeout)
					this.autoCheckInTimeout = null
				}
				this.autoCheckInTimeout = setTimeout(this.addAutoEntry,seconds * 1000)
			}
			else {
				if(this.autoCheckInTimeout !== null) {
					clearTimeout(this.autoCheckInTimeout)
					this.autoCheckInTimeout = null
				}
			
				this.checkInTime.time = 0
			}
			this.diaryItems.push( new diaryItem(
				new Date().toTimeString(),
				document.getElementById("entry-description").value,
				document.getElementById("entry-yes").checked,
				document.getElementById("entry-rating").value + " rating"
			))
			startTime = new Date()
			elapsedTime.time = 0
		},
		selectEntry: function(entryid) {
			//console.log("selectedEntry is " + entryid)
			var selectedEntry = this.diaryItems.filter(function(item) {
				//console.log(item.id)
				return (item.id === entryid)
			})
	
			//console.log("selectedEntry is now " + selectedEntry );
			this.currentlyDisplayedEntry.isSelected = false;
			if(selectedEntry.length > 0) {
				this.currentlyDisplayedEntry = selectedEntry[0]
				this.currentlyDisplayedEntry.isSelected = true;
			}
			
			if(this.currentlyDisplayedEntry.isAuto === true) {
				this.isAddEntry = true
			}
			else {
				this.isAddEntry = false
			}
		}
	}
})