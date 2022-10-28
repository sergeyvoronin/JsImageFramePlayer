/* js image frame player script
Sergey Voronin */

//total number of images for the slideshow
var total_number_of_images;
//number of event we want to view
var selected_event; 
//the path to the images
var path_to_images;


//an array holding the images for the current event	
var image_array;
//the selected event
var selected_event_str;
//the current day number
var image_num;

//initially show is not active so timer can be started	
var show_active = false; 
//this var controls the direction of playback -> forward by default
var advanceForward = true;
//the speed at which the slides advance
var showSpeed;
//the timer that calls the next or previous image function at the above show speed 
var showTimer;


//declare global variables for loadShow -> was required for older I.E.
var slideshow_name;
var show_image_path;
var show_image_type;
var show_num_images;
var show_default_speed;
var marked_frames = [];


/* ##### start generic slideshow code ----->  ##### */

/* slideshow constructor - calls callback function when loading is complete */
function Slideshow(image_src_array){

   // alert('in Slideshow Constructor image_src_array.length = ' + image_src_array.length);

	//initialize class variables--->

	//number of images for the slideshow
	this.number_of_images = image_src_array.length;
	//this.number_of_images = total_number_of_images+1;
	//number of images pre-loaded
	this.number_loaded = 0;
	//number of images processed (not all of these may have been preloaded successfully)
	this.number_processed = 0;
	//if the slideshow images actually exist
	this.slideshow_images_exist = 0;
	//array to hold the pre-loaded images
	image_array = new Array;
	
	//initialize a status box to display a loading message
	this.status_bar = document.getElementById('status_box_js');
	this.status_bar.innerHTML = "<br /><br /><br />Loading Images <=> Please Wait";

	//preload each image
	for (var i = 0; i < image_src_array.length; i++) 
		this.preload(image_src_array[i]);
}


/* preload member function - preloads an individual image */
Slideshow.prototype.preload = function(image_src){

	//create new Image object
	var objImage = new Image;

	//set up an onload handler for the Image object
	objImage.onload = Slideshow.prototype.image_onload;

	//set up an onerror handler for the Image object
	objImage.onerror = Slideshow.prototype.image_onloaderror;

	//set up an onabort handler for the Image object
	objImage.onabort = Slideshow.prototype.image_onloaderror;
	
	//assign a pointer to a Slideshow object (so that we can access the member variables)
	objImage.objSlideshow = this;
	
	//this field indicates whether the image has been preloaded
	objImage.preloaded = false;
	
	//set the src of our Image object
	objImage.src = image_src;

        //add this image object to the Slideshow image_array (done at end now..) 
	image_array.push(objImage);
	
}


/* checkProgress member function - checks if all the images have been processed and calls
the callback if this is the case */
Slideshow.prototype.checkProgress = function(){
	this.number_processed++;
	if(this.number_processed == this.number_of_images){
		
		if(this.number_loaded == this.number_processed){
		    this.status_bar.innerHTML = "";
		}
		else{
		    this.status_bar.innerHTML = "<br />Slideshow Loaded, but with Errors";
		}

		//reset the show if all images have been processed
		resetShow();

                //unhide the image and controls
		showImage();
		showControls();

	}
	else{
		num_processed_str = this.number_processed + '';
		num_images_str = this.number_of_images + '';
		this.status_bar.innerHTML = "<br /><br /><br />Loading Images <=> Please Wait (" + num_processed_str + " / " + num_images_str + ")";
	}
}


/* image onload member function - called for each image that has been preloaded */
Slideshow.prototype.image_onload = function(){
	this.preloaded = true;
	this.objSlideshow.number_loaded++;
	this.objSlideshow.checkProgress();
}


/* image onloaderror member function - called for each image that has failed to preload properly */
Slideshow.prototype.image_onloaderror = function(){
	this.preloaded = false;
	this.objSlideshow.checkProgress();
}


/* ##### start specific slideshow code ----->  ##### */


/* wrapper load function -> calls the load function for the slideshow we want */
function loadShow(){

	//hide image and controls before loading has finished
	hideImage();
	hideControls();

	//get the requested slideshow name identifier
	slideshow_name_elem = document.getElementById('slideshow_name_js');
	slideshow_name = slideshow_name_elem.value;

        //get root image path
	show_image_path_elem = document.getElementById('slideshow_image_path_js');
	show_image_path = show_image_path_elem.value;

        //get image type
	show_image_type_elem = document.getElementById('slideshow_image_type_js');
	show_image_type = show_image_type_elem.value;

        //get number of images in show
	show_num_images_elem = document.getElementById('slideshow_num_images_js');
	show_num_images = show_num_images_elem.value;

        //get default speed of show
        show_default_speed_elem = document.getElementById('slideshow_default_speed_js');
	show_default_speed = show_default_speed_elem.value;

        //convert to num and str
        show_num_images = show_num_images*1;
	total_number_of_images = show_num_images;
	slideshow_name_str = slideshow_name + '';


        //set fps rate and frame number jump defaults
        fps_rate_elem = document.getElementById('fps_rate_js');
	fps_rate_elem.value = show_default_speed;

        frame_number_elem = document.getElementById('frame_number_js');
	frame_number_elem.value = Math.round(show_num_images/2);



	// alert('will call loadCustomShow with\nshow_image_path = ' + show_image_path + '\nshow_image_type = ' + show_image_type + '\nshow_num_images = ' + show_num_images + '\nshow_default_speed = ' + show_default_speed + '\n');

	//call the proper load function
        loadCustomShow(show_image_path, show_image_type, show_num_images, show_default_speed);
}




/* load function for the slideshow */
function loadCustomShow(show_image_path, show_image_type, show_num_images, show_default_speed){
	
	//initialize base image path
	path_to_images = show_image_path;

	//set up image src array
	image_src_array = new Array;
	total_number_of_images = show_num_images;

	//preload the images for the selected event
	for(image_num=1; image_num<=total_number_of_images; image_num++){
		image_num_str = image_num+'';

                image_prefix = 'output_';

                if(image_num<10){
                    image_prefix = 'output_000';
                }
                else if(image_num>=10 && image_num<100){
                    image_prefix = 'output_00';
                }
				else if(image_num>=100 && image_num<1000){
                    image_prefix = 'output_0';
				}
				//image_prefix = image_prefix.concat('_');

		image_src = path_to_images + "/" + image_prefix + image_num_str + "." + show_image_type;
		image_src_array.push(image_src);
	}

        //alert('done scanning images');

	hideImage();
	var objShow = new Slideshow(image_src_array);

}

/* reloads the slideshow */
function reloadShow(){

    //free elements
    for(image_num=1; image_num<=total_number_of_images; image_num++){
        delete image_array[image_num];
    }
    
    //delete current image array
    image_array.length = 0;

    //load the slideshow again
    loadShow();
}





/* ##### start generic slideshow control code ----->  ##### */


function advanceImage(){
	if(image_num > total_number_of_images || image_num < 1){
		stopShow();
		return;
	}
	if(advanceForward && image_num < total_number_of_images){ image_num++; }
	else if(!advanceForward && image_num > 1){ image_num--; }
	setPicture(image_num);
}

/* plays the show; check for show_active to prevent starting more than one timer */
function playShow(){
	if(!show_active){
		showTimer = setInterval("advanceImage()",showSpeed);
		show_active = true;
	}
}


function setPicture(image_num){
	current_picture = image_array[image_num-1].src;
	//update image
	slide_show_image_elem = document.getElementById('slide_show_image_js');
	slide_show_image_elem.src = current_picture;
	//update frame number
	current_frame_elem = document.getElementById('current_frame_js');
	current_frame_elem.value = image_num + ' / ' + total_number_of_images;
}


function startShow(){
	advanceForward = true;
	fps_rate_elem = document.getElementById('fps_rate_js');
	if(!show_active){
		user_speed = fps_rate_elem.value;
		showSpeed = 1000.0/user_speed;
		playShow();
	}
}


function startShowBackward(){
	advanceForward = false;
	fps_rate_elem = document.getElementById('fps_rate_js');
	if(!show_active){
		user_speed = fps_rate_elem.value;
		showSpeed = 1000.0/user_speed;
		playShow();
	}
}


function stepForward(){
	if(show_active){ stopShow(); }
	if(image_num < total_number_of_images){ setPicture(++image_num); }
}


function stepBackward(){
	if(show_active){ stopShow(); }
	if(image_num > 1){ setPicture(--image_num); }
}


function stepToBeginning(){
	image_num = 1;
	if(show_active){ stopShow(); }
	setPicture(image_num);
}


function stepToEnd(){
	image_num = total_number_of_images;
	if(show_active){ stopShow(); }
	setPicture(image_num);
}


function stopShow(){
	show_active = false;
	clearInterval(showTimer);
}


function resetShow(){
	stopShow();
	image_num = 1;
	setPicture(image_num);
}


function gotoFrame(){
	frame_num_elem = document.getElementById('frame_number_js');
	frame_num = frame_num_elem.value;
        frame_num = frame_num*1; //treat as a num

	if(show_active){ stopShow(); }
	if(frame_num <= total_number_of_images){
		image_num = frame_num;
		setPicture(image_num);
	}
	else{ alert("Sorry, but there are only " + total_number_of_images + " frames"); }
}


/* mark frame for high q */
function markFrame(){
	marked_frames.push(image_num);
	// update list
	marked_frames_elem = document.getElementById('marked_frame_js');
    	marked_frames_elem.value = marked_frames.toString();
}

/* mark frame for high q */
function unmarkFrame(){
	marked_frames.pop(image_num);

	// update list
	marked_frames_elem = document.getElementById('marked_frame_js');
    marked_frames_elem.value = marked_frames.toString();
}




function increaseFPS(){
	fps_rate_elem = document.getElementById('fps_rate_js');
	user_speed = fps_rate_elem.value;
	user_speed++;
	fps_rate_elem.value = user_speed;
	showSpeed = 1000.0/user_speed;
	if(show_active){
		stopShow();
		if(advanceForward)
			startShow();
		else
			startShowBackward();
	}
}


function decreaseFPS(){
	fps_rate_elem = document.getElementById('fps_rate_js');
	user_speed = fps_rate_elem.value;
	//only decrease speed if it makes it >= 1fps
	if(user_speed > 1){
		user_speed--;
		fps_rate_elem.value = user_speed;
		showSpeed = 1000.0/user_speed;
		if(show_active){
			stopShow();
			if(advanceForward)
				startShow();
			else
				startShowBackward();
		}
	}
}


function hideControls(){
	control1 = document.getElementById('slide_show_controls_js1');
	control2 = document.getElementById('slide_show_controls_js2');
	control1.style.visibility = 'hidden';
	control2.style.visibility = 'hidden';
}


function showControls(){
	control1 = document.getElementById('slide_show_controls_js1');
	control2 = document.getElementById('slide_show_controls_js2');
	control1.style.visibility = 'visible';
	control2.style.visibility = 'visible';
}


function hideImage(){
	image_box = document.getElementById('slide_show_image_div_js');
	image_box.style.visibility = 'hidden';
}


function showImage(){
	image_box = document.getElementById('slide_show_image_div_js');
	image_box.style.visibility = 'visible';
}

