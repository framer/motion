import { DetailedHTMLFactory, ReactHTML, ReactSVG, SVGAttributes } from "react"
import { createMotionComponent } from "./create"
import { MakeMotion, MotionProps } from "../../../motion/types"

type UnwrapFactoryAttributes<F> = F extends DetailedHTMLFactory<infer P, any>
    ? P
    : never
type UnwrapFactoryElement<F> = F extends DetailedHTMLFactory<any, infer P>
    ? P
    : never

/**
 * Blanket-accept any SVG attribute as a `MotionValue`
 * @public
 */
interface SVGAttributesWithoutMotionProps<T>
    extends Pick<
        SVGAttributes<T>,
        Exclude<keyof SVGAttributes<T>, keyof MotionProps>
    > {}
export type SVGAttributesAsMotionValues<T> = MakeMotion<
    SVGAttributesWithoutMotionProps<T>
>

type UnwrapSVGFactoryElement<F> = F extends React.SVGProps<infer P> ? P : never

export interface SVGMotionProps<T>
    extends SVGAttributesAsMotionValues<T>,
        MotionProps {}

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
export const MotionAnimate = /*@__PURE__*/ createMotionComponent<
    SVGMotionProps<UnwrapSVGFactoryElement<ReactSVG["animate"]>>,
    UnwrapSVGFactoryElement<ReactSVG["animate"]>
>("animate")

export const MotionCircle = /*@__PURE__*/ createMotionComponent<
    SVGMotionProps<UnwrapSVGFactoryElement<ReactSVG["circle"]>>,
    UnwrapSVGFactoryElement<ReactSVG["circle"]>
>("circle")

export const MotionDefs = /*@__PURE__*/ createMotionComponent<
    SVGMotionProps<UnwrapSVGFactoryElement<ReactSVG["defs"]>>,
    UnwrapSVGFactoryElement<ReactSVG["defs"]>
>("defs")

export const MotionDesc = /*@__PURE__*/ createMotionComponent<
    SVGMotionProps<UnwrapSVGFactoryElement<ReactSVG["desc"]>>,
    UnwrapSVGFactoryElement<ReactSVG["desc"]>
>("desc")

export const MotionEllipse = /*@__PURE__*/ createMotionComponent<
    SVGMotionProps<UnwrapSVGFactoryElement<ReactSVG["ellipse"]>>,
    UnwrapSVGFactoryElement<ReactSVG["ellipse"]>
>("ellipse")

export const MotionG = /*@__PURE__*/ createMotionComponent<
    SVGMotionProps<UnwrapSVGFactoryElement<ReactSVG["g"]>>,
    UnwrapSVGFactoryElement<ReactSVG["g"]>
>("g")

export const MotionImage = /*@__PURE__*/ createMotionComponent<
    SVGMotionProps<UnwrapSVGFactoryElement<ReactSVG["image"]>>,
    UnwrapSVGFactoryElement<ReactSVG["image"]>
>("image")

export const MotionLine = /*@__PURE__*/ createMotionComponent<
    SVGMotionProps<UnwrapSVGFactoryElement<ReactSVG["line"]>>,
    UnwrapSVGFactoryElement<ReactSVG["line"]>
>("line")

export const MotionFilter = /*@__PURE__*/ createMotionComponent<
    SVGMotionProps<UnwrapSVGFactoryElement<ReactSVG["filter"]>>,
    UnwrapSVGFactoryElement<ReactSVG["filter"]>
>("filter")

export const MotionMarker = /*@__PURE__*/ createMotionComponent<
    SVGMotionProps<UnwrapSVGFactoryElement<ReactSVG["marker"]>>,
    UnwrapSVGFactoryElement<ReactSVG["marker"]>
>("marker")

export const MotionMask = /*@__PURE__*/ createMotionComponent<
    SVGMotionProps<UnwrapSVGFactoryElement<ReactSVG["mask"]>>,
    UnwrapSVGFactoryElement<ReactSVG["mask"]>
>("mask")

export const MotionMetadata = /*@__PURE__*/ createMotionComponent<
    SVGMotionProps<UnwrapSVGFactoryElement<ReactSVG["metadata"]>>,
    UnwrapSVGFactoryElement<ReactSVG["metadata"]>
>("metadata")

export const MotionPath = /*@__PURE__*/ createMotionComponent<
    SVGMotionProps<UnwrapSVGFactoryElement<ReactSVG["path"]>>,
    UnwrapSVGFactoryElement<ReactSVG["path"]>
>("path")

export const MotionPattern = /*@__PURE__*/ createMotionComponent<
    SVGMotionProps<UnwrapSVGFactoryElement<ReactSVG["pattern"]>>,
    UnwrapSVGFactoryElement<ReactSVG["pattern"]>
>("pattern")

export const MotionPolygon = /*@__PURE__*/ createMotionComponent<
    SVGMotionProps<UnwrapSVGFactoryElement<ReactSVG["polygon"]>>,
    UnwrapSVGFactoryElement<ReactSVG["polygon"]>
>("polygon")

export const MotionPolyline = /*@__PURE__*/ createMotionComponent<
    SVGMotionProps<UnwrapSVGFactoryElement<ReactSVG["polyline"]>>,
    UnwrapSVGFactoryElement<ReactSVG["polyline"]>
>("polyline")

export const MotionRect = /*@__PURE__*/ createMotionComponent<
    SVGMotionProps<UnwrapSVGFactoryElement<ReactSVG["rect"]>>,
    UnwrapSVGFactoryElement<ReactSVG["rect"]>
>("rect")

export const MotionStop = /*@__PURE__*/ createMotionComponent<
    SVGMotionProps<UnwrapSVGFactoryElement<ReactSVG["stop"]>>,
    UnwrapSVGFactoryElement<ReactSVG["stop"]>
>("stop")

export const MotionSvg = /*@__PURE__*/ createMotionComponent<
    SVGMotionProps<UnwrapSVGFactoryElement<ReactSVG["svg"]>>,
    UnwrapSVGFactoryElement<ReactSVG["svg"]>
>("svg")

export const MotionSymbol = /*@__PURE__*/ createMotionComponent<
    SVGMotionProps<UnwrapSVGFactoryElement<ReactSVG["symbol"]>>,
    UnwrapSVGFactoryElement<ReactSVG["symbol"]>
>("symbol")

export const MotionText = /*@__PURE__*/ createMotionComponent<
    SVGMotionProps<UnwrapSVGFactoryElement<ReactSVG["text"]>>,
    UnwrapSVGFactoryElement<ReactSVG["text"]>
>("text")

export const MotionTspan = /*@__PURE__*/ createMotionComponent<
    SVGMotionProps<UnwrapSVGFactoryElement<ReactSVG["tspan"]>>,
    UnwrapSVGFactoryElement<ReactSVG["tspan"]>
>("tspan")

export const MotionUse = /*@__PURE__*/ createMotionComponent<
    SVGMotionProps<UnwrapSVGFactoryElement<ReactSVG["use"]>>,
    UnwrapSVGFactoryElement<ReactSVG["use"]>
>("use")

export const MotionView = /*@__PURE__*/ createMotionComponent<
    SVGMotionProps<UnwrapSVGFactoryElement<ReactSVG["view"]>>,
    UnwrapSVGFactoryElement<ReactSVG["view"]>
>("view")

export const MotionClipPath = /*@__PURE__*/ createMotionComponent<
    SVGMotionProps<UnwrapSVGFactoryElement<ReactSVG["clipPath"]>>,
    UnwrapSVGFactoryElement<ReactSVG["clipPath"]>
>("clipPath")

export const MotionFeBlend = /*@__PURE__*/ createMotionComponent<
    SVGMotionProps<UnwrapSVGFactoryElement<ReactSVG["feBlend"]>>,
    UnwrapSVGFactoryElement<ReactSVG["feBlend"]>
>("feBlend")

export const MotionFeColorMatrix = /*@__PURE__*/ createMotionComponent<
    SVGMotionProps<UnwrapSVGFactoryElement<ReactSVG["feColorMatrix"]>>,
    UnwrapSVGFactoryElement<ReactSVG["feColorMatrix"]>
>("feColorMatrix")

export const MotionFeComponentTransfer = /*@__PURE__*/ createMotionComponent<
    SVGMotionProps<UnwrapSVGFactoryElement<ReactSVG["feComponentTransfer"]>>,
    UnwrapSVGFactoryElement<ReactSVG["feComponentTransfer"]>
>("feComponentTransfer")

export const MotionFeComposite = /*@__PURE__*/ createMotionComponent<
    SVGMotionProps<UnwrapSVGFactoryElement<ReactSVG["feComposite"]>>,
    UnwrapSVGFactoryElement<ReactSVG["feComposite"]>
>("feComposite")

export const MotionFeConvolveMatrix = /*@__PURE__*/ createMotionComponent<
    SVGMotionProps<UnwrapSVGFactoryElement<ReactSVG["feConvolveMatrix"]>>,
    UnwrapSVGFactoryElement<ReactSVG["feConvolveMatrix"]>
>("feConvolveMatrix")

export const MotionFeDiffuseLighting = /*@__PURE__*/ createMotionComponent<
    SVGMotionProps<UnwrapSVGFactoryElement<ReactSVG["feDiffuseLighting"]>>,
    UnwrapSVGFactoryElement<ReactSVG["feDiffuseLighting"]>
>("feDiffuseLighting")

export const MotionFeDisplacementMap = /*@__PURE__*/ createMotionComponent<
    SVGMotionProps<UnwrapSVGFactoryElement<ReactSVG["feDisplacementMap"]>>,
    UnwrapSVGFactoryElement<ReactSVG["feDisplacementMap"]>
>("feDisplacementMap")

export const MotionFeDistantLight = /*@__PURE__*/ createMotionComponent<
    SVGMotionProps<UnwrapSVGFactoryElement<ReactSVG["feDistantLight"]>>,
    UnwrapSVGFactoryElement<ReactSVG["feDistantLight"]>
>("feDistantLight")

export const MotionFeDropShadow = /*@__PURE__*/ createMotionComponent<
    SVGMotionProps<UnwrapSVGFactoryElement<ReactSVG["feDropShadow"]>>,
    UnwrapSVGFactoryElement<ReactSVG["feDropShadow"]>
>("feDropShadow")

export const MotionFeFlood = /*@__PURE__*/ createMotionComponent<
    SVGMotionProps<UnwrapSVGFactoryElement<ReactSVG["feFlood"]>>,
    UnwrapSVGFactoryElement<ReactSVG["feFlood"]>
>("feFlood")

export const MotionFeFuncA = /*@__PURE__*/ createMotionComponent<
    SVGMotionProps<UnwrapSVGFactoryElement<ReactSVG["feFuncA"]>>,
    UnwrapSVGFactoryElement<ReactSVG["feFuncA"]>
>("feFuncA")

export const MotionFeFuncB = /*@__PURE__*/ createMotionComponent<
    SVGMotionProps<UnwrapSVGFactoryElement<ReactSVG["feFuncB"]>>,
    UnwrapSVGFactoryElement<ReactSVG["feFuncB"]>
>("feFuncB")

export const MotionFeFuncG = /*@__PURE__*/ createMotionComponent<
    SVGMotionProps<UnwrapSVGFactoryElement<ReactSVG["feFuncG"]>>,
    UnwrapSVGFactoryElement<ReactSVG["feFuncG"]>
>("feFuncG")

export const MotionFeFuncR = /*@__PURE__*/ createMotionComponent<
    SVGMotionProps<UnwrapSVGFactoryElement<ReactSVG["feFuncR"]>>,
    UnwrapSVGFactoryElement<ReactSVG["feFuncR"]>
>("feFuncR")

export const MotionFeGaussianBlur = /*@__PURE__*/ createMotionComponent<
    SVGMotionProps<UnwrapSVGFactoryElement<ReactSVG["feGaussianBlur"]>>,
    UnwrapSVGFactoryElement<ReactSVG["feGaussianBlur"]>
>("feGaussianBlur")

export const MotionFeImage = /*@__PURE__*/ createMotionComponent<
    SVGMotionProps<UnwrapSVGFactoryElement<ReactSVG["feImage"]>>,
    UnwrapSVGFactoryElement<ReactSVG["feImage"]>
>("feImage")

export const MotionFeMerge = /*@__PURE__*/ createMotionComponent<
    SVGMotionProps<UnwrapSVGFactoryElement<ReactSVG["feMerge"]>>,
    UnwrapSVGFactoryElement<ReactSVG["feMerge"]>
>("feMerge")

export const MotionFeMergeNode = /*@__PURE__*/ createMotionComponent<
    SVGMotionProps<UnwrapSVGFactoryElement<ReactSVG["feMergeNode"]>>,
    UnwrapSVGFactoryElement<ReactSVG["feMergeNode"]>
>("feMergeNode")

export const MotionFeMorphology = /*@__PURE__*/ createMotionComponent<
    SVGMotionProps<UnwrapSVGFactoryElement<ReactSVG["feMorphology"]>>,
    UnwrapSVGFactoryElement<ReactSVG["feMorphology"]>
>("feMorphology")

export const MotionFeOffset = /*@__PURE__*/ createMotionComponent<
    SVGMotionProps<UnwrapSVGFactoryElement<ReactSVG["feOffset"]>>,
    UnwrapSVGFactoryElement<ReactSVG["feOffset"]>
>("feOffset")

export const MotionFePointLight = /*@__PURE__*/ createMotionComponent<
    SVGMotionProps<UnwrapSVGFactoryElement<ReactSVG["fePointLight"]>>,
    UnwrapSVGFactoryElement<ReactSVG["fePointLight"]>
>("fePointLight")

export const MotionFeSpecularLighting = /*@__PURE__*/ createMotionComponent<
    SVGMotionProps<UnwrapSVGFactoryElement<ReactSVG["feSpecularLighting"]>>,
    UnwrapSVGFactoryElement<ReactSVG["feSpecularLighting"]>
>("feSpecularLighting")

export const MotionFeSpotLight = /*@__PURE__*/ createMotionComponent<
    SVGMotionProps<UnwrapSVGFactoryElement<ReactSVG["feSpotLight"]>>,
    UnwrapSVGFactoryElement<ReactSVG["feSpotLight"]>
>("feSpotLight")

export const MotionFeTile = /*@__PURE__*/ createMotionComponent<
    SVGMotionProps<UnwrapSVGFactoryElement<ReactSVG["feTile"]>>,
    UnwrapSVGFactoryElement<ReactSVG["feTile"]>
>("feTile")

export const MotionFeTurbulence = /*@__PURE__*/ createMotionComponent<
    SVGMotionProps<UnwrapSVGFactoryElement<ReactSVG["feTurbulence"]>>,
    UnwrapSVGFactoryElement<ReactSVG["feTurbulence"]>
>("feTurbulence")

export const MotionForeignObject = /*@__PURE__*/ createMotionComponent<
    SVGMotionProps<UnwrapSVGFactoryElement<ReactSVG["foreignObject"]>>,
    UnwrapSVGFactoryElement<ReactSVG["foreignObject"]>
>("foreignObject")

export const MotionLinearGradient = /*@__PURE__*/ createMotionComponent<
    SVGMotionProps<UnwrapSVGFactoryElement<ReactSVG["linearGradient"]>>,
    UnwrapSVGFactoryElement<ReactSVG["linearGradient"]>
>("linearGradient")

export const MotionRadialGradient = /*@__PURE__*/ createMotionComponent<
    SVGMotionProps<UnwrapSVGFactoryElement<ReactSVG["radialGradient"]>>,
    UnwrapSVGFactoryElement<ReactSVG["radialGradient"]>
>("radialGradient")

export const MotionTextPath = /*@__PURE__*/ createMotionComponent<
    SVGMotionProps<UnwrapSVGFactoryElement<ReactSVG["textPath"]>>,
    UnwrapSVGFactoryElement<ReactSVG["textPath"]>
>("textPath")
