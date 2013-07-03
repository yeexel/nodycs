#!/usr/bin/env node
/*
*************************************************
*   nodycs - favorite lyrics in your console
*************************************************
*   Created by Oleksii Kulikov
*   Email: hello@yeexel.com
*/
var VERSION = '0.1';

var util = require('util');
var aparser = require('aparser'); // argv parser
var restler = require('restler'); // HTTP client library
var cheerio = require('cheerio'); // jQuery core

var api_key = [
    'KEY', // musixmatch.com
    'KEY' // lyrics.com
];

var url_show = util.format(
    'http://www.songlyrics.com/%s/%s-lyrics/',
    process.argv[3],
    process.argv[4]
);

var url_find = util.format(
    'http://api.musixmatch.com/ws/1.1/track.search?apikey=%s&q_lyrics=%s&format=json',
    api_key[0],
    process.argv[3]
);

var url_top = util.format(
    'http://www.lyrics.com/user/api/%s/top_tracks/%s',
    api_key[1],
    process.argv[3]
);

var show_help = function() {
    util.puts('nodycs v. ' + VERSION);
    util.puts('How to use:');
    util.puts("$ nodycs show '<artist>' '<song>' // show lyrics");
    util.puts("$ nodycs find '<lyrics>' // find song or artist");
    util.puts("$ nodycs top <number> // print top lyrics");
};

var nodycs = function(url, mode) {

    restler.get(url).on('complete', function(result) {

        if (result instanceof Error) {

            console.log("Error: " + result.message);
            this.retry(3000); // try again after 3 sec
        
        } else {

            if (mode === 'show') {

                var artist = process.argv[3].replace(' ', '-');
                var song = process.argv[4].replace(' ', '-');

                $ = cheerio.load(result);
                var lyrics = $('#songLyricsDiv').text();

                console.log(lyrics);

            } else if (mode === 'find') {
                // TODO -> smart recommendation system
                var obj = JSON.parse(result);
                var tracklist = obj.message.body.track_list;

                for (var i = 0; i < tracklist.length; i++) {
                    console.log(tracklist[i].track.artist_name + ' - ' + tracklist[i].track.track_name);
                }

            } else { // mode === 'top'

                var obj = JSON.parse(result);

                for (var i = 0; i < obj.results.length; i++) {
                    console.log(obj.results[i].artist + ' - ' + obj.results[i].song);
                }

            }
        }

    });

};

if (process.argv.slice(2).length === 0) show_help();

aparser.on('show', function() {
    nodycs(url_show, 'show');
});

aparser.on('find', function() {
    nodycs(url_find, 'find');
});

aparser.on('top', function() {
    nodycs(url_top, 'top');
});

aparser.on('help', function() {
    show_help();
});

aparser.parse(process.argv);

