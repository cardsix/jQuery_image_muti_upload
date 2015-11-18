/*
2015-11-3  jquery多文件图片上传插件  浙江省新昌县城西小学 唐明 qq:147885198
主要功能：
	1、支持拖放上传和文件选择上传
	2、图片可自定义最大尺寸，js自动缩小后上传
	3、上传base64编码后的文件信息，服务端需要进行解码保存
	4、有上传进度显示，共几个文件，每个文件的上传进度。
	5、当前只支持HTML5浏览器，尤其是对canvas、filereader的支持
构造参数：
	file_list	文件列表，一般在input type=file中获得，或是在拖放对象中获得
	url			服务端上传处理地址
	opt			设置
				max			--图片允许最大高度或宽度		数值：默认1600
				allow_ext	--允许上传的图片类型			数组：['.jpg','.png','.gif']
				img_compress--是否压缩图片					布尔：默认true
				post_data	--发送到服务器的POST数据		object
				call_back	--所有图片上传完毕				function

改进列表
2015-11-13 
	POST时增加文件名filename参数
	opt参数增加2项
		post_data	--发送到服务器的POST数据		object
		call_back	--所有图片上传完毕时回调		function

2015-11-16	增加window.URL.revokeObjectURL(this.src)用于释放资源

主要问题：上传进度不明显
		  不压缩图片时，如果图片太大，base64后会更大，可能会超过服务器post限制


	
*/

(function($){
	
	$.upload_muti=function(file_list,url,opt){
		this.options={max:1600,allow_ext:['.png','.jpg','.gif'],img_compress:true};
		if(opt){
			for(key in opt){
				this.options[key]=opt[key];
			}
		}
		this.abort_flag=false;
		this.list=this.filter_list(file_list);
		this.idx=0;
		this.file_num=this.list.length;
		this.url=url;
		this.img=$('<img/>');
		this.canvas=document.createElement('canvas');
	}
	$.upload_muti.prototype.start=function(){
		this.init_progress();
		this.upload_one(this.url,this);
	}
	//过滤文件类型
	$.upload_muti.prototype.filter_list=function (list){
		var ret=[];
		var filename,index1,index2,ext;
		for(var i=0,len=list.length;i<len;i++){
			filename=list[i].name;
			index1=filename.lastIndexOf(".");  
			index2=filename.length;  
			ext=filename.substring(index1,index2).toLowerCase();//后缀名小写 
			if($.inArray(ext,this.options.allow_ext)){
				ret[ret.length]=list[i];
			}
		}
		return ret;
	}
	
	$.upload_muti.prototype.upload_one=function (url){
		var that=this;		
		if(that.abort_flag) return;
		
		this.compress.call(this,this.list[that.idx],this.options.max,function(img_data){
			if(that.abort_flag) return;
			that.post.call(that,url,img_data,that.list[that.idx].name,function(ret){
				if(that.abort_flag) return;
				that.idx++;
				if(that.idx<that.file_num) {
					that.upload_one.call(that,url,that)
				}else{
					that.close_progress.call(that);
					if(that.options.callback){
						that.options.callback();
					}
				}
			});
		},this.options.img_compress);
	}
	
	$.upload_muti.prototype.abort=function (){
		if(confirm('确定要停止上传图片吗？')){
			this.abort_flag=true;
			this.close_progress();
		}
	};
	
	//压缩图片
	$.upload_muti.prototype.compress=function (file, max,callback,img_compress){
	var that=this;
    var reader = new FileReader();

    reader.onload = function (e) {
		if(img_compress){
			var image = that.img;
			image.one('load', function () {
				if(isNaN(max)) max=1600;
				var imageWidth=100,imageHeight=100;
				//计算缩放后的长和宽
				if (this.width > this.height) {//横向
					  if(this.width>max){
						imageWidth = max;
						imageHeight = Math.round(max/this.width*this.height);
					  }else{
						imageWidth=this.width;
						imageHeight=this.height;
					  }
			   } else {//纵向
					  if(this.height>max){
						imageHeight = max;
						imageWidth = Math.round(max/this.height*this.width);
					  }else{
						imageWidth=this.width;
						imageHeight=this.height;
					  }
			   }
				 var canvas = that.canvas;

				 canvas.width = imageWidth;
				 canvas.height = imageHeight;

				 var context = canvas.getContext('2d');
				 context.clearRect(0, 0, imageWidth, imageHeight);

				context.drawImage(this, 0, 0, imageWidth, imageHeight);
				window.URL.revokeObjectURL(this.src); // 释放内存资源
				var data = canvas.toDataURL('image/jpeg');
				if(callback) callback(data);
			 });

			  image.attr('src', e.target.result);
		}else{
			if(callback) callback(e.target.result);
		}
		reader=null;
       };
 
     reader.readAsDataURL(file);
	}	
	//进度条初始化
	$.upload_muti.prototype.init_progress=function (){
		var html='<div style="width:600px;position:fixed;z-index:1000;background:#fff;border:1px solid #058;border-radius:5px;box-shadow:3px 3px 8px;">'+
		'<div style="background:#058;color:#fff;font-weight:bold;font-size:16px;padding:5px 3px;text-align:center;">文件上传进度</div>'+
		'<table width="100%" cellspacing="0" cellpadding="4" style="font-size:14px;">'+
		'<tr><td width="85">'+
		'&nbsp;当前文件：'+
		'</td><td>'+
		'<div style="position:relative;background-color:#F0EFEF;border:1px solid #cccccc;padding:2px;font-size:13px;"><span style="position:relative;text-align:right;color:#ffffff;height:18px;line-height:18px;font-family:Arial;display:block;width:0%;background-color:#66CC33;" id="__upload_file_progress">0%</span></div>'+
		'</td></tr><tr><td>'+
		'&nbsp;所有文件：'+
		'</td><td>'+
		'<div style="position:relative;background-color:#F0EFEF;border:1px solid #cccccc;padding:2px;font-size:13px;"><span style="position:relative;text-align:left;overflow:hidden;color:#ffffff;height:18px;line-height:18px;font-family:Arial;display:block;width:0%;background-color:#66CC33;" id="__upload_all_file_progress">共0个/当前0个</span></div>'+
		'</td></tr></table>'+
		'<hr style="margin:5px;"/>'+
		'<div style="padding:1px 0 5px 0;text-align:right;"><button style="border:none;background:#f00;color:#fff;padding:5px 20px;cursor:pointer;border-radius:3px;margin-right:10px;" id="__upload_abort_btn">中止上传</button></div>'+
		'</div>';
		this.cover_div=$('<div style="position:absolute;z-index:999;background:#000;opacity:0.2;"></div>');
		this.progress=$(html);
		this.progress.appendTo('body');
		this.cover_div.appendTo('body');
		this.cover_div.css('left','0px');
		this.cover_div.css('top','0px');
		this.cover_div.width($(document).width());
		this.cover_div.height($(document).height());
		this.progress.css('left',($(window).width()-this.progress.width())/2+'px');
		this.progress.css('top',($(window).height()-this.progress.height())/2+'px');
		this.prog_one=$('#__upload_file_progress');
		this.prog_all=$('#__upload_all_file_progress');
		$('#__upload_abort_btn').click(this.abort);
	}
	//设置进度
	$.upload_muti.prototype.set_progess=function (p_one,total,cur){
		this.prog_one.css('width',p_one+'%');
		this.prog_one.text(p_one+'%');
		var p=Math.round(cur/total*100);
		this.prog_all.css('width',p+'%');
		this.prog_all.text('共'+total+'个/当前'+cur+'个');
	}
	//关闭进度条
	$.upload_muti.prototype.close_progress=function (){
		this.cover_div.remove();
		this.progress.remove();
	}
	//上传文件
	$.upload_muti.prototype.post=function (url,data,filename,callback){
		var that=this;
		var temp=data.split(',');
		var jpg_data=temp[1];
		if(this.options.post_data){
			var parm=this.options.post_data;
		}else{
			var parm={};
		}
		parm.data=jpg_data;
		parm.filename=filename;
		$.ajax({
		  xhr: function()
		  {
			var xhr = new XMLHttpRequest();
			//上传进度
			xhr.upload.addEventListener("progress", function(evt){
				//console.log(evt);
			  if (evt.lengthComputable) {
				var percentComplete = evt.loaded / evt.total;				
				//console.log(percentComplete);
				that.set_progess.call(that,percentComplete*100,that.file_num,that.idx);
			  }
			}, false);
			//下载进度
			xhr.addEventListener("progress", function(evt){
			  if (evt.lengthComputable) {
				var percentComplete = evt.loaded / evt.total;
				//console.log(percentComplete);
			  }
			}, false);
			return xhr;
		  },
		  type: 'POST',
		  url: url,
		  data: parm,
		  success: function(data){
			console.log(data);
			callback(data);
		  }
		});											
	}
})(jQuery);






