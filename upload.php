<!doctype html>
<html>
<head>
<meta charset="gb2312"/>
<title>图库程序</title>
<style type="text/css">

</style>
</head>
<body>
<input type="file" id="input"  multiple="multiple">
<script src='jquery.min.js'></script>
<script src='fileread_xhr_upload.js'></script>
<script>  
    var inputElement = document.getElementById("input");    
	inputElement.addEventListener("change", handleFiles, false);  
  
	function handleFiles(){  
		var fileList = this.files;
		var upload=new $.upload_muti(fileList,'upload_do.php');
		upload.start();
		

	}

   </script>  
</body>
</html>