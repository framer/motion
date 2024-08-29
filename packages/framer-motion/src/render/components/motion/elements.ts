import { DetailedHTMLFactory, ReactHTML } from "react"
import { createMotionComponent } from "./create"

type UnwrapFactoryAttributes<F> = F extends DetailedHTMLFactory<infer P, any>
    ? P
    : never
type UnwrapFactoryElement<F> = F extends DetailedHTMLFactory<any, infer P>
    ? P
    : never

/**
 * HTML components
 */
export const MotionA = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["a"]>,
    UnwrapFactoryElement<ReactHTML["a"]>
>("a")
export const MotionAbbr = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["abbr"]>,
    UnwrapFactoryElement<ReactHTML["abbr"]>
>("abbr")
export const MotionAddress = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["address"]>,
    UnwrapFactoryElement<ReactHTML["address"]>
>("address")
export const MotionArea = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["area"]>,
    UnwrapFactoryElement<ReactHTML["area"]>
>("area")
export const MotionArticle = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["article"]>,
    UnwrapFactoryElement<ReactHTML["article"]>
>("article")
export const MotionAside = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["aside"]>,
    UnwrapFactoryElement<ReactHTML["aside"]>
>("aside")
export const MotionAudio = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["audio"]>,
    UnwrapFactoryElement<ReactHTML["audio"]>
>("audio")
export const MotionB = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["b"]>,
    UnwrapFactoryElement<ReactHTML["b"]>
>("b")
export const MotionBase = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["base"]>,
    UnwrapFactoryElement<ReactHTML["base"]>
>("base")
export const MotionBdi = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["bdi"]>,
    UnwrapFactoryElement<ReactHTML["bdi"]>
>("bdi")
export const MotionBdo = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["bdo"]>,
    UnwrapFactoryElement<ReactHTML["bdo"]>
>("bdo")
export const MotionBig = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["big"]>,
    UnwrapFactoryElement<ReactHTML["big"]>
>("big")
export const MotionBlockquote = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["blockquote"]>,
    UnwrapFactoryElement<ReactHTML["blockquote"]>
>("blockquote")
export const MotionBody = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["body"]>,
    UnwrapFactoryElement<ReactHTML["body"]>
>("body")
export const MotionButton = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["button"]>,
    UnwrapFactoryElement<ReactHTML["button"]>
>("button")
export const MotionCanvas = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["canvas"]>,
    UnwrapFactoryElement<ReactHTML["canvas"]>
>("canvas")
export const MotionCaption = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["caption"]>,
    UnwrapFactoryElement<ReactHTML["caption"]>
>("caption")
export const MotionCite = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["cite"]>,
    UnwrapFactoryElement<ReactHTML["cite"]>
>("cite")
export const MotionCode = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["code"]>,
    UnwrapFactoryElement<ReactHTML["code"]>
>("code")
export const MotionCol = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["col"]>,
    UnwrapFactoryElement<ReactHTML["col"]>
>("col")
export const MotionColgroup = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["colgroup"]>,
    UnwrapFactoryElement<ReactHTML["colgroup"]>
>("colgroup")
export const MotionData = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["data"]>,
    UnwrapFactoryElement<ReactHTML["data"]>
>("data")
export const MotionDatalist = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["datalist"]>,
    UnwrapFactoryElement<ReactHTML["datalist"]>
>("datalist")
export const MotionDd = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["dd"]>,
    UnwrapFactoryElement<ReactHTML["dd"]>
>("dd")
export const MotionDel = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["del"]>,
    UnwrapFactoryElement<ReactHTML["del"]>
>("del")
export const MotionDetails = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["details"]>,
    UnwrapFactoryElement<ReactHTML["details"]>
>("details")
export const MotionDfn = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["dfn"]>,
    UnwrapFactoryElement<ReactHTML["dfn"]>
>("dfn")
export const MotionDialog = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["dialog"]>,
    UnwrapFactoryElement<ReactHTML["dialog"]>
>("dialog")
export const MotionDiv = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["div"]>,
    UnwrapFactoryElement<ReactHTML["div"]>
>("div")
export const MotionDl = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["dl"]>,
    UnwrapFactoryElement<ReactHTML["dl"]>
>("dl")
export const MotionDt = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["dt"]>,
    UnwrapFactoryElement<ReactHTML["dt"]>
>("dt")
export const MotionEm = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["em"]>,
    UnwrapFactoryElement<ReactHTML["em"]>
>("em")
export const MotionEmbed = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["embed"]>,
    UnwrapFactoryElement<ReactHTML["embed"]>
>("embed")
export const MotionFieldset = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["fieldset"]>,
    UnwrapFactoryElement<ReactHTML["fieldset"]>
>("fieldset")
export const MotionFigcaption = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["figcaption"]>,
    UnwrapFactoryElement<ReactHTML["figcaption"]>
>("figcaption")
export const MotionFigure = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["figure"]>,
    UnwrapFactoryElement<ReactHTML["figure"]>
>("figure")
export const MotionFooter = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["footer"]>,
    UnwrapFactoryElement<ReactHTML["footer"]>
>("footer")
export const MotionForm = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["form"]>,
    UnwrapFactoryElement<ReactHTML["form"]>
>("form")
export const MotionH1 = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["h1"]>,
    UnwrapFactoryElement<ReactHTML["h1"]>
>("h1")
export const MotionH2 = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["h2"]>,
    UnwrapFactoryElement<ReactHTML["h2"]>
>("h2")
export const MotionH3 = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["h3"]>,
    UnwrapFactoryElement<ReactHTML["h3"]>
>("h3")
export const MotionH4 = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["h4"]>,
    UnwrapFactoryElement<ReactHTML["h4"]>
>("h4")
export const MotionH5 = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["h5"]>,
    UnwrapFactoryElement<ReactHTML["h5"]>
>("h5")
export const MotionH6 = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["h6"]>,
    UnwrapFactoryElement<ReactHTML["h6"]>
>("h6")
export const MotionHead = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["head"]>,
    UnwrapFactoryElement<ReactHTML["head"]>
>("head")
export const MotionHeader = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["header"]>,
    UnwrapFactoryElement<ReactHTML["header"]>
>("header")
export const MotionHgroup = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["hgroup"]>,
    UnwrapFactoryElement<ReactHTML["hgroup"]>
>("hgroup")
export const MotionHr = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["hr"]>,
    UnwrapFactoryElement<ReactHTML["hr"]>
>("hr")
export const MotionHtml = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["html"]>,
    UnwrapFactoryElement<ReactHTML["html"]>
>("html")
export const MotionI = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["i"]>,
    UnwrapFactoryElement<ReactHTML["i"]>
>("i")
export const MotionIframe = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["iframe"]>,
    UnwrapFactoryElement<ReactHTML["iframe"]>
>("iframe")
export const MotionImg = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["img"]>,
    UnwrapFactoryElement<ReactHTML["img"]>
>("img")
export const MotionInput = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["input"]>,
    UnwrapFactoryElement<ReactHTML["input"]>
>("input")
export const MotionIns = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["ins"]>,
    UnwrapFactoryElement<ReactHTML["ins"]>
>("ins")
export const MotionKbd = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["kbd"]>,
    UnwrapFactoryElement<ReactHTML["kbd"]>
>("kbd")
export const MotionKeygen = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["keygen"]>,
    UnwrapFactoryElement<ReactHTML["keygen"]>
>("keygen")
export const MotionLabel = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["label"]>,
    UnwrapFactoryElement<ReactHTML["label"]>
>("label")
export const MotionLegend = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["legend"]>,
    UnwrapFactoryElement<ReactHTML["legend"]>
>("legend")
export const MotionLi = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["li"]>,
    UnwrapFactoryElement<ReactHTML["li"]>
>("li")
export const MotionLink = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["link"]>,
    UnwrapFactoryElement<ReactHTML["link"]>
>("link")
export const MotionMain = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["main"]>,
    UnwrapFactoryElement<ReactHTML["main"]>
>("main")
export const MotionMap = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["map"]>,
    UnwrapFactoryElement<ReactHTML["map"]>
>("map")
export const MotionMark = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["mark"]>,
    UnwrapFactoryElement<ReactHTML["mark"]>
>("mark")
export const MotionMenu = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["menu"]>,
    UnwrapFactoryElement<ReactHTML["menu"]>
>("menu")
export const MotionMenuitem = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["menuitem"]>,
    UnwrapFactoryElement<ReactHTML["menuitem"]>
>("menuitem")
export const MotionMeter = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["meter"]>,
    UnwrapFactoryElement<ReactHTML["meter"]>
>("meter")
export const MotionNav = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["nav"]>,
    UnwrapFactoryElement<ReactHTML["nav"]>
>("nav")
export const MotionObject = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["object"]>,
    UnwrapFactoryElement<ReactHTML["object"]>
>("object")
export const MotionOl = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["ol"]>,
    UnwrapFactoryElement<ReactHTML["ol"]>
>("ol")
export const MotionOptgroup = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["optgroup"]>,
    UnwrapFactoryElement<ReactHTML["optgroup"]>
>("optgroup")
export const MotionOption = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["option"]>,
    UnwrapFactoryElement<ReactHTML["option"]>
>("option")
export const MotionOutput = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["output"]>,
    UnwrapFactoryElement<ReactHTML["output"]>
>("output")
export const MotionP = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["p"]>,
    UnwrapFactoryElement<ReactHTML["p"]>
>("p")
export const MotionParam = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["param"]>,
    UnwrapFactoryElement<ReactHTML["param"]>
>("param")
export const MotionPicture = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["picture"]>,
    UnwrapFactoryElement<ReactHTML["picture"]>
>("picture")
export const MotionPre = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["pre"]>,
    UnwrapFactoryElement<ReactHTML["pre"]>
>("pre")
export const MotionProgress = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["progress"]>,
    UnwrapFactoryElement<ReactHTML["progress"]>
>("progress")
export const MotionQ = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["q"]>,
    UnwrapFactoryElement<ReactHTML["q"]>
>("q")
export const MotionRp = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["rp"]>,
    UnwrapFactoryElement<ReactHTML["rp"]>
>("rp")
export const MotionRt = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["rt"]>,
    UnwrapFactoryElement<ReactHTML["rt"]>
>("rt")
export const MotionRuby = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["ruby"]>,
    UnwrapFactoryElement<ReactHTML["ruby"]>
>("ruby")
export const MotionS = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["s"]>,
    UnwrapFactoryElement<ReactHTML["s"]>
>("s")
export const MotionSamp = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["samp"]>,
    UnwrapFactoryElement<ReactHTML["samp"]>
>("samp")
export const MotionScript = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["script"]>,
    UnwrapFactoryElement<ReactHTML["script"]>
>("script")
export const MotionSection = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["section"]>,
    UnwrapFactoryElement<ReactHTML["section"]>
>("section")
export const MotionSelect = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["select"]>,
    UnwrapFactoryElement<ReactHTML["select"]>
>("select")
export const MotionSmall = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["small"]>,
    UnwrapFactoryElement<ReactHTML["small"]>
>("small")
export const MotionSource = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["source"]>,
    UnwrapFactoryElement<ReactHTML["source"]>
>("source")
export const MotionSpan = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["span"]>,
    UnwrapFactoryElement<ReactHTML["span"]>
>("span")
export const MotionStrong = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["strong"]>,
    UnwrapFactoryElement<ReactHTML["strong"]>
>("strong")
export const MotionStyle = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["style"]>,
    UnwrapFactoryElement<ReactHTML["style"]>
>("style")
export const MotionSub = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["sub"]>,
    UnwrapFactoryElement<ReactHTML["sub"]>
>("sub")
export const MotionSummary = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["summary"]>,
    UnwrapFactoryElement<ReactHTML["summary"]>
>("summary")
export const MotionSup = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["sup"]>,
    UnwrapFactoryElement<ReactHTML["sup"]>
>("sup")
export const MotionTable = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["table"]>,
    UnwrapFactoryElement<ReactHTML["table"]>
>("table")
export const MotionTbody = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["tbody"]>,
    UnwrapFactoryElement<ReactHTML["tbody"]>
>("tbody")
export const MotionTd = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["td"]>,
    UnwrapFactoryElement<ReactHTML["td"]>
>("td")
export const MotionTextarea = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["textarea"]>,
    UnwrapFactoryElement<ReactHTML["textarea"]>
>("textarea")
export const MotionTfoot = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["tfoot"]>,
    UnwrapFactoryElement<ReactHTML["tfoot"]>
>("tfoot")
export const MotionTh = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["th"]>,
    UnwrapFactoryElement<ReactHTML["th"]>
>("th")
export const MotionThead = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["thead"]>,
    UnwrapFactoryElement<ReactHTML["thead"]>
>("thead")
export const MotionTime = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["time"]>,
    UnwrapFactoryElement<ReactHTML["time"]>
>("time")
export const MotionTitle = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["title"]>,
    UnwrapFactoryElement<ReactHTML["title"]>
>("title")
export const MotionTr = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["tr"]>,
    UnwrapFactoryElement<ReactHTML["tr"]>
>("tr")
export const MotionTrack = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["track"]>,
    UnwrapFactoryElement<ReactHTML["track"]>
>("track")
export const MotionU = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["u"]>,
    UnwrapFactoryElement<ReactHTML["u"]>
>("u")
export const MotionUl = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["ul"]>,
    UnwrapFactoryElement<ReactHTML["ul"]>
>("ul")
export const MotionVideo = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["video"]>,
    UnwrapFactoryElement<ReactHTML["video"]>
>("video")
export const MotionWbr = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["wbr"]>,
    UnwrapFactoryElement<ReactHTML["wbr"]>
>("wbr")
export const MotionWebview = /*@__PURE__*/ createMotionComponent<
    UnwrapFactoryAttributes<ReactHTML["webview"]>,
    UnwrapFactoryElement<ReactHTML["webview"]>
>("webview")

/**
 * SVG components
 * TODO: Generate list with props/instance
 */
export const MotionAnimate = /*@__PURE__*/ createMotionComponent("animate")
export const MotionCircle = /*@__PURE__*/ createMotionComponent("circle")
export const MotionDefs = /*@__PURE__*/ createMotionComponent("defs")
export const MotionDesc = /*@__PURE__*/ createMotionComponent("desc")
export const MotionEllipse = /*@__PURE__*/ createMotionComponent("ellipse")
export const MotionG = /*@__PURE__*/ createMotionComponent("g")
export const MotionImage = /*@__PURE__*/ createMotionComponent("image")
export const MotionLine = /*@__PURE__*/ createMotionComponent("line")
export const MotionFilter = /*@__PURE__*/ createMotionComponent("filter")
export const MotionMarker = /*@__PURE__*/ createMotionComponent("marker")
export const MotionMask = /*@__PURE__*/ createMotionComponent("mask")
export const MotionMetadata = /*@__PURE__*/ createMotionComponent("metadata")
export const MotionPath = /*@__PURE__*/ createMotionComponent("path")
export const MotionPattern = /*@__PURE__*/ createMotionComponent("pattern")
export const MotionPolygon = /*@__PURE__*/ createMotionComponent("polygon")
export const MotionPolyline = /*@__PURE__*/ createMotionComponent("polyline")
export const MotionRect = /*@__PURE__*/ createMotionComponent("rect")
export const MotionStop = /*@__PURE__*/ createMotionComponent("stop")
export const MotionSvg = /*@__PURE__*/ createMotionComponent("svg")
export const MotionSymbol = /*@__PURE__*/ createMotionComponent("symbol")
export const MotionText = /*@__PURE__*/ createMotionComponent("text")
export const MotionTspan = /*@__PURE__*/ createMotionComponent("tspan")
export const MotionUse = /*@__PURE__*/ createMotionComponent("use")
export const MotionView = /*@__PURE__*/ createMotionComponent("view")
export const MotionClipPath = /*@__PURE__*/ createMotionComponent("clipPath")
export const MotionFeBlend = /*@__PURE__*/ createMotionComponent("feBlend")
export const MotionFeColorMatrix =
    /*@__PURE__*/ createMotionComponent("feColorMatrix")
export const MotionFeComponentTransfer = /*@__PURE__*/ createMotionComponent(
    "feComponentTransfer"
)
export const MotionFeComposite =
    /*@__PURE__*/ createMotionComponent("feComposite")
export const MotionFeConvolveMatrix =
    /*@__PURE__*/ createMotionComponent("feConvolveMatrix")
export const MotionFeDiffuseLighting =
    /*@__PURE__*/ createMotionComponent("feDiffuseLighting")
export const MotionFeDisplacementMap =
    /*@__PURE__*/ createMotionComponent("feDisplacementMap")
export const MotionFeDistantLight =
    /*@__PURE__*/ createMotionComponent("feDistantLight")
export const MotionFeDropShadow =
    /*@__PURE__*/ createMotionComponent("feDropShadow")
export const MotionFeFlood = /*@__PURE__*/ createMotionComponent("feFlood")
export const MotionFeFuncA = /*@__PURE__*/ createMotionComponent("feFuncA")
export const MotionFeFuncB = /*@__PURE__*/ createMotionComponent("feFuncB")
export const MotionFeFuncG = /*@__PURE__*/ createMotionComponent("feFuncG")
export const MotionFeFuncR = /*@__PURE__*/ createMotionComponent("feFuncR")
export const MotionFeGaussianBlur =
    /*@__PURE__*/ createMotionComponent("feGaussianBlur")
export const MotionFeImage = /*@__PURE__*/ createMotionComponent("feImage")
export const MotionFeMerge = /*@__PURE__*/ createMotionComponent("feMerge")
export const MotionFeMergeNode =
    /*@__PURE__*/ createMotionComponent("feMergeNode")
export const MotionFeMorphology =
    /*@__PURE__*/ createMotionComponent("feMorphology")
export const MotionFeOffset = /*@__PURE__*/ createMotionComponent("feOffset")
export const MotionFePointLight =
    /*@__PURE__*/ createMotionComponent("fePointLight")
export const MotionFeSpecularLighting =
    /*@__PURE__*/ createMotionComponent("feSpecularLighting")
export const MotionFeSpotLight =
    /*@__PURE__*/ createMotionComponent("feSpotLight")
export const MotionFeTile = /*@__PURE__*/ createMotionComponent("feTile")
export const MotionFeTurbulence =
    /*@__PURE__*/ createMotionComponent("feTurbulence")
export const MotionForeignObject =
    /*@__PURE__*/ createMotionComponent("foreignObject")
export const MotionLinearGradient =
    /*@__PURE__*/ createMotionComponent("linearGradient")
export const MotionRadialGradient =
    /*@__PURE__*/ createMotionComponent("radialGradient")
export const MotionTextPath = /*@__PURE__*/ createMotionComponent("textPath")
