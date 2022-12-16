import 'package:flutter/material.dart';

void main() {
  runApp(
    MaterialApp(
      home: Scaffold(
        appBar: AppBar( 
          leading: Icon(Icons.menu),
          title: Text("Hello World Updated")
        ),
        body: Center(
          child: FlutterLogo(
            size: 200
          ),
        )
      )
    )
  );
}