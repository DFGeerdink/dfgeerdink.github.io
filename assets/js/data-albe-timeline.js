//Json Object
var data = [
	{
		time: '2018-09-01',
		body: [{
			tag: 'img',
			attr: {
				src: '/assets/img/tu-delft.png',
				width: '150px',
				cssclass: 'img-responsive'
			}
		},
		{
			tag: 'h2',
			content: "Started MSc Chemical Engineering"
		},
		{
			tag: 'p',
			content: 'Building upon its proven strength, the Chemical Engineering Department develops the science and technology of processes that power a sustainable society, focusing on energy, water, health and environment.'
		}],
	},
	{
		time: '2018-06-12',
		body: [{
			tag: 'img',
			attr: {
				src: '/assets/img/Polariks.png',
				width: '150px',
				cssclass: 'img-responsive'
			}
		},
		{
			tag: 'h2',
			content: 'Fulltime job as Data Engineer at Polariks'
		},
		{
			tag: 'p',
			content: 'Developing a data driven agriculture analysis method based on Hyperspectral Imaging. This technology allows for better harvest planning, increased efficiency in resources and early detection of diseases in the viticulture (wines) industry.'
		}],
		footer: 'Link: <a href="https://www.polariks.com/">https://www.polariks.com/</a>'
	},
	{
		time: '2018-02-24',
		body: [{
			tag: 'img',
			attr: {
				src: '/assets/img/aus.png',
				width: '150px',
				cssclass: 'img-responsive'
			}
		},
		{
			tag: 'h2',
			content: 'Three month roadtrip through Australia.'
		},
		{
			tag: 'p',
			content: 'A mindblowingly beautiful journey which I tried to capture in this very blog.'
		}],
		footer: 'Link: <a href="https://daangeerdink.nl/category/travel/">Check it here!</a>'
	},
	{
		time: '2017-11-01',
		body: [{
			tag: 'img',
			attr: {
				src: '/assets/img/Geodan.png',
				width: '150px',
				cssclass: 'img-responsive'
			}
		},
		{
			tag: 'h2',
			content: 'Data Sciene Research Internship at Geodan'
		},
		{
			tag: 'p',
			content: 'Reconstruction of zebra crossings from aerial imagery has been achieved utilizing deep machine learning. The scaleable workflow makes use of data collection from open sources, smart data preprocessing, training of a regional convolutional neural network and 3D reconstruction in Unity. This has shown to be a time efficient and accurate method to extract features from aerial imagery.'
		}],
		footer: 'Link: <a href="https://www.geodan.nl/">https://www.geodan.nl/</a>'
	},
	{
		time: '2016-09-01',
		body: [{
			tag: 'img',
			attr: {
				src: '/assets/img/TG.png',
				width: '150px',
				cssclass: 'img-responsive-noround'
			}
		},
		{
			tag: 'h2',
			content: 'Secretary 123rd board of Technologisch Gezelschap'
		},
		{
			tag: 'p',
			content: 'An unforgettable year at the head of the student association for Chemical Engineering at Delft University of Technology. Responsible for all contact to and from the study association, members database, the association website and the secretarial annual report. Launching partner of the <a href="https://delftcareerplatform.nl/">Delft Career Platform</a> and creator of the TG Digital Archive.'
		}],
		footer: 'Link: <a href="https://technologischgezelschap.nl/">https://technologischgezelschap.nl/</a>'
	},
	{
		time: '2013-09-01',
		body: [{
			tag: 'img',
			attr: {
				src: '/assets/img/tu-delft.png',
				width: '100px',
				cssclass: 'img-responsive'
			}
		},
		{
			tag: 'h2',
			content: 'Started BSc Molecular Science & Technology'
		},
		{
			tag: 'p',
			content: 'This joint chemistry degree programme is run by Leiden University and Delft University of Technology, the basis of the research is knowledge about how molecules react with each other and how we can influence their structure and properties.'
		}]
	}
];

$(document).ready(function () {

	$("#myTimeline").albeTimeline(data);

});