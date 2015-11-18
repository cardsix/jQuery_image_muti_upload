<?php
if(isset($_POST['data'])){
	$f=base64_decode($_POST['data']);
	$fname=date('Ymdhis').rand(1000,9999).'.jpg';
	$upload_dir='pic_uploads/';
		if(!is_dir($upload_dir)){
			mkdir($upload_dir);
		}
	file_put_contents($upload_dir.$fname, $f);
	echo $fname;
}
?>