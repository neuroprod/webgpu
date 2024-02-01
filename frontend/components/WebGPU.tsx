import React from 'react'
import { GoogleAnalytics } from '@next/third-parties/google'
import Head from 'next/head'
import Main from "../src/Main";


export default class WebGPU extends React.Component {
    private main: Main;

    componentDidMount() {

        let canvas = document.getElementById("webgpu") as HTMLCanvasElement;
        this.main = new Main(canvas);

    }

    render() {
        return (<div>
            <Head>
                <title>webgpu</title>
                <meta charSet="utf-8"/>
                <meta name="viewport" content="initial-scale=1.0, maximum-scale=1.0, user-scalable=0, width=device-width"/>
                <meta property="og:image" content="https://www.website.com/logo.jpg"/>
                <meta property="og:image:type" content="image/png"/>
                <meta property="og:image:width" content="1024"/>
                <meta property="og:image:height" content="1024"/>
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://www.website.com/"/>
                <meta property="og:title" content="Website title" />
                <meta property="og:description" content="Website description." />
            </Head>
                <GoogleAnalytics gaId="G-B1CYW0MX02" />


            <canvas id="webgpu"></canvas>

        </div>

        )
    }


}
