##jquery多文件图片上传插件 
浙江省新昌县城西小学 唐明 qq:147885198

##主要功能：

1. 支持拖放上传和文件选择上传
2. 图片可自定义最大尺寸，js自动缩小后上传
3. 上传base64编码后的文件信息，服务端需要进行解码保存
4. 有上传进度显示，共几个文件，每个文件的上传进度。
5. 当前只支持HTML5浏览器，尤其是对canvas、filereader的支持

##构造参数：

* file_list	文件列表，一般在input type=file中获得，或是在拖放对象中获得
* url			服务端上传处理地址
* opt			设置
* max			--图片允许最大高度或宽度		数值：默认1600
* allow_ext	--允许上传的图片类型			数组：['.jpg','.png','.gif']
* img_compress--是否压缩图片					布尔：默认true
* post_data	--发送到服务器的POST数据		object
* call_back	--所有图片上传完毕				function

##改进列表##
* 2015-11-3  创作
* 2015-11-13 
* POST时增加文件名filename参数
* opt参数增加2项
* post_data	--发送到服务器的POST数据		object
* call_back	--所有图片上传完毕时回调		function

2015-11-16	增加window.URL.revokeObjectURL(this.src)用于释放资源

##主要问题：##
1. 上传进度不明显
2. 不压缩图片时，如果图片太大，base64后会更大，可能会超过服务器post限制

使用方法：绑定input type="file"的change事件

    $('#file1').on('change',upload_files);
    function upload_files(){
    	//console.log(this.files);
    	var fileList = this.files;
    	var upload=new $.upload_muti(fileList,'upload_do.php',{max:2000,callback:upload_close,post_data:{path_id:path_id}});
    	upload.start();
    }
