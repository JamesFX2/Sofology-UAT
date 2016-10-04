<?php 

// just to reiterate - this is nowhere near production level code and was created to support other aspects of the UAT process


deleteOldFiles(getcwd(),"sitemap.xml");

if(!file_exists("sitemap.xml"))
{

	$storeholder = json_decode(getWebPagePassword("https://api.sofology.co.uk/api/store"));
	$store = array();
	foreach ($storeholder as $key => $location)
	{
		$store[$key] = "https://www.sofology.co.uk/stores/".rawurlencode(strtolower(str_replace(" ","-",$location->outlet)));
	}
	
	
	
	
	//$store is set
	
	
	$getRanges = "[".parseSofas(getWebPagePassword('https://www.sofology.co.uk/angular/scripts/combined.js'))."]";
	$rangesProc = findCodes($getRanges,",category:\"","\"");
	$ranges = array();
	foreach ($rangesProc as $key => $page)
	{
		$ranges[$key] = "https://www.sofology.co.uk/".rawurlencode($page);
	}	
	
	
	
	//$ranges is set
	
	//print_r($ranges);die;
	$static = array();
	/*
	$getStatic = getWebPagePassword('https://www.sofology.co.uk/app.routes.js');
	$staticProc = findCodes($getStatic," url: '","'");
	
	
	
	foreach ($staticProc as $key => $page)
	{
		if(strpos($page,":")===false && strpos($page,"^/{id}")===false)
		{

		$static[] = "https://www.sofology.co.uk".str_replace("^","",$page);
		}
	}	
	
	//$static pages are set.
	
	*/


	$test = "[".parseData(getWebPagePassword('https://www.sofology.co.uk/angular/app.config.js'))."]";
	/*
	$test = str_replace("$$$$$$$$$$$","'",str_replace("'",'"',str_replace("\'","$$$$$$$$$$$",$test)));
	$test = str_replace("code:",'"code":',$test);
	$test = str_replace("title:",'"title":',$test);
	$test = str_replace("meta:",'"meta":',$test);
	echo str_replace("            ","test",$test);*/
	
	
	$apiScrape = findCodes($test,"code:",",");
	
	$allProducts = array();
	unset($text);
	
	for($i=0;$i<count($apiScrape);$i++)
	{
		
		$text  = json_decode(getWebPagePassword("https://api.sofology.co.uk/api/catalog/".$apiScrape[$i]));
		
		for($j=0;$j<count($text);$j++)
		{
			$allProducts[] = "https://www.sofology.co.uk/sofas/".strtolower(rawurlencode($text[$j]->rangeName));	
		}
		
		
		
		
		
	}
	
	// $allProducts is set
	
	
	$text = getWebPagePassword('https://www.sofology.co.uk/angular/views/outlet.html');
	$document = new DOMDocument();
	if($text)
	{
		libxml_use_internal_errors(true);
		$document->loadHTML($text);
		libxml_clear_errors();
	}
	
	$links = array();
	
	foreach($document->getElementsByTagName('a') as $anchors)
	{
    $anchor = array
    (
        'href' => $anchors->getAttribute('href')
    );
    
    if( ! $anchor['href'])
        continue;

    $links[] = "https://www.sofology.co.uk".$anchor['href'];
	}
	
	
	$text = getWebPagePassword('https://www.sofology.co.uk/sitemap');
	$document = new DOMDocument();
	if($text)
	{
		libxml_use_internal_errors(true);
		$document->loadHTML($text);
		libxml_clear_errors();
	}
	$xpath = new DOMXpath($document);
	$results = $xpath->query('//nav[@class="sitemap"]');
	
	$static = array();
	foreach($results as $result)
	{
		foreach($result->getElementsByTagName('a') as $anchors)
		{
		$anchor = array
		(
			'href' => $anchors->getAttribute('href')
		);
		
		if( ! $anchor['href'])
			continue;

		$static[] = "https://www.sofology.co.uk".$anchor['href'];
		}
	}
	$text = getWebPagePassword('https://www.sofology.co.uk/blog/rss/');
	$blogs = findCodes($text,"<link>","</link>");

	

	
	for($m=0;$m<count($store);$m++)
	{
		$allPages[] = $store[$m];
	}
	
	for($m=0;$m<count($static);$m++)
	{
		$allPages[] = $static[$m];
	}
	
	for($m=0;$m<count($links);$m++)
	{
		$allPages[] = $links[$m];
	}
	
	
	
	for($m=0;$m<count($allProducts);$m++)
	{
		$allPages[] = $allProducts[$m];
	}

	for($m=0;$m<count($ranges);$m++)
	{
		$allPages[] = $ranges[$m];
	}
	for($m=0;$m<count($blogs);$m++)
	{
		$allPages[] = $blogs[$m];
	}
	
		
	
	
	$allPages = array_unique($allPages);
	
	
	
	
	$schema = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>
<urlset xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:image=\"http://www.google.com/schemas/sitemap-image/1.1\" xsi:schemaLocation=\"http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd\" xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\" >";


	$fp = fopen('sitemap.xml', 'w');
	

	fwrite($fp,$schema);
	foreach($allPages as $value)
	{
		fwrite($fp,"<url>");
		fwrite($fp,"<loc>".$value."</loc>");
		fwrite($fp,"<lastmod>".date("c")."</lastmod>");
		fwrite($fp,"<changefreq>weekly</changefreq>");
		fwrite($fp,"<priority>1</priority>");
		fwrite($fp,"</url>");
		
	}
	fwrite($fp,"</urlset>");
	fclose($fp);	
}		
	
	//print_r($allPages);
	

header("HTTP/1.1 301 Moved Permanently"); 
header("Location: sitemap.xml");
		

function deleteOldFiles($location,$prefix,$hours=24)
{
	$files = array();
	$allList = scandir($location);
	foreach($allList as $item)
	{
		if(!is_dir($item) && strpos($item,$prefix) !== false)
		{
			$stats = stat($location."/".$item);

			$creation = $stats[10];

			if(time() > ($creation + (3600*$hours)))
			{	
				unlink($location."/".$item);
			}
			
		}
		
	}
			
}
	
	
	


function parseData($text)
{
	$start=strpos($text,"provide.constant('categories', ")+strlen("provide.constant('categories', ");
	$end=strpos($text,'});',$start)+1;
	return substr($text,$start,($end-$start));
}

function parseSofas($text)
{
	$find = "scope.ranges =";
	$term = " ];";
	
	$start=strpos($text,$find)+strlen($find);
	$end=strpos($text,$term,$start)+1;
	return substr($text,$start,($end-$start));
}


function findCodes($data,$stringstart,$stringend)
{
	$count = 0;
	$holder = array();
	while(strpos($data,$stringstart,$count)!==false)
	{
		$start = strpos($data,$stringstart,$count) + strlen($stringstart);
		$end = strpos($data,$stringend,$start);
		$holder[] = trim(str_replace("'","",substr($data,$start,($end-$start))));
		$count = $end;
	}
	return $holder;
}
		




$header = array('Referer: http://test.com',
        'Origin: http://www.sofology.co.uk',
        'Connection: keep-alive',
		'User-Agent: Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.87 Safari/537.36',
		'Accept-Encoding: gzip, deflate, sdch',
        'Accept: application/json, text/plain, */*',
        'Cache-Control: no-cache',
        'Except:');
		

		


	
		
function getWebPage($url)
{
	global $header;
	$ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	//curl_setopt($ch, CURLOPT_HEADER, true);
	curl_setopt($ch, CURLOPT_HTTPHEADER, $header);
	curl_setopt($ch, CURLINFO_HEADER_OUT, true);
	curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
	curl_setopt($ch, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4 );
	$text = curl_exec($ch);
	return $text;
}

function getWebPagePassword($url)
{
	global $header;
	$username = "test";
	$password = "apple123";
	$ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
	//curl_setopt($ch, CURLOPT_HEADER, true);
	//curl_setopt($ch, CURLOPT_USERPWD, "$username:$password");
	//curl_setopt($ch, CURLOPT_HTTPAUTH, CURLAUTH_ANY);
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
	
	$text = curl_exec($ch);
	return $text;
}	
	

	



?>
