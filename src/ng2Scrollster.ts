import {Component, ViewChild, OnInit, ElementRef, Input} from "@angular/core";

@Component({
    selector: '[scrollster]',
    template: `
    <div #contentWrapper class="content-wrapper">
        <div #scrollableContent class="scrollable-content">
            <ng-content></ng-content>
        </div>
        <div #scrollBarV class="scroll-bar-v"></div>
        <div #scrollBarH class="scroll-bar-h"></div>
    </div>
    `,
    styles: [`
        .content-wrapper {
            position: relative;
            overflow: hidden;
        }
        .scrollable-content {
            top: 0;
            position: relative;
        }
        .scroll-bar-h, .scroll-bar-v {
            position: absolute;
            background: #424242;
            cursor: pointer;
            opacity: 0.7;
        }
        .scroll-bar-h {
            right: 2px;
            height: 5px;
            border-radius: 3px;
        }
        .scroll-bar-v {
            top: 0;
            width: 5px;
            right: 2px;
            border-radius: 3px;
        }
    `]
})

export class Ng2Scrollster implements OnInit {
    @ViewChild('contentWrapper', {read: ElementRef}) contentWrapperRef;
    @ViewChild('scrollableContent', {read: ElementRef}) scrollableContentRef;
    @ViewChild('scrollBarV', {read: ElementRef}) scrollBarVRef;
    @ViewChild('scrollBarH', {read: ElementRef}) scrollBarHRef;

    @Input() barOptions;

    private SCROLL_DISTANCE;
    private scrollableContent;
    private contentWrapper;
    private scrollBarV;
    private scrollBarH;

    ngOnInit() : void {
        this.init();
    }

    private scrollContent (target, delta, distance, isTargetRelativeToBoundary: boolean) : void {
        let top = parseFloat(getComputedStyle(target).top);
        let scrollableDistance = top + (delta * distance);


        if(isTargetRelativeToBoundary){
            let scrollLimit = this.contentWrapper.clientHeight - this.scrollBarV.offsetHeight;

            if(scrollableDistance <= 0) {
                this.setTop(target, 0);
                return;
            } else if ((target.offsetHeight + scrollableDistance) >= this.contentWrapper.clientHeight) {
                this.setTop(target, scrollLimit);
                return;
            }
            this.setTop(target, scrollableDistance);
        } else {
            if(scrollableDistance >= 0) {
                this.setTop(target, 0);
                return;
            } else if ((parseInt(target.offsetHeight) - Math.abs(scrollableDistance)) <= parseInt(this.contentWrapper.clientHeight)) {
                this.setTop(target, -1 * (parseInt(target.offsetHeight) - parseInt(this.contentWrapper.offsetHeight)) - 16);
                return;
            }
            this.setTop(target, scrollableDistance);
        }
    }

    private dragContent(target, distance, isTargetRelativeToBoundary) : void {
        if(isTargetRelativeToBoundary){
            let scrollLimit = this.contentWrapper.clientHeight - this.scrollBarV.offsetHeight;
            if(distance <= 0) {
                this.setTop(target, 0);
                return;
            }
            else if ((target.offsetHeight + distance) >= this.contentWrapper.clientHeight) {
                this.setTop(target, scrollLimit);
                return;
            }
            this.setTop(target, distance);
        } else {
            if(distance >= 0) {
                this.setTop(target, 0);
                return;
            } else if ((parseInt(target.offsetHeight) - Math.abs(distance)) <= parseInt(this.contentWrapper.clientHeight)) {
                this.setTop(target, -1 * (parseInt(target.offsetHeight) - parseInt(this.contentWrapper.offsetHeight)) - 16);
                return;
            }
            this.setTop(target, distance);
        }
    }

    private getWheelDelta (evt : any) : number {
        return evt.deltaY > 0 ? -1 : 1
    }

    private initScrollables () : void {
        this.contentWrapper.removeEventListener('wheel', this.getWheelHandler());
        this.contentWrapper.addEventListener('wheel', this.getWheelHandler());
    }

    private setContainerHeight () : void {
        this.contentWrapper.style.height = !(this.contentWrapper.parentNode.clientHeight < 150) ?
            this.contentWrapper.parentNode.clientHeight : 300;
    }

    private setTop(el, top) : void {
        el.style.top = top;
    }

    initHorizontalScroll () : void {
        let isScrollable;

        setTimeout(() => {
            let barLength = parseInt(this.contentWrapper.clientHeight) /
                parseFloat(this.scrollableContent.clientHeight) * parseInt(this.contentWrapper.clientHeight);

            isScrollable = barLength < this.contentWrapper.clientHeight ? true : false;
            if(!isScrollable) return;
            this.scrollBarV.style.height = barLength;

            this.initContentCSS();
            this.initBarCSS();
            this.initBarDrag();
            this.initScrollables();
        }, 1);
    }

    private initBarDrag(): void {
        let isBarDragging = false,
            startPosY;

        this.scrollBarV.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            isBarDragging = true;

            startPosY = this.scrollBarV.offsetTop;
        });
        window.addEventListener('mousemove', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if(!isBarDragging) return;

            let mouseInnerPosY = e.pageY - this.contentWrapper.offsetTop;
            let currentPosY = mouseInnerPosY - .5 * this.scrollBarV.offsetHeight;

            this.dragContent(this.scrollBarV, currentPosY, true);
            this.dragContent(this.scrollableContent, -(currentPosY * (this.scrollableContent.clientHeight/this.contentWrapper.clientHeight)), false);
        })
        window.addEventListener('mouseup', (e) => {
            if(!isBarDragging) return;
            isBarDragging = false;
        })
    }

    private initContentCSS() : void {
        this.contentWrapper.style.paddingRight = this.scrollBarV.offsetWidth;
    }

    private watchScrollableContent() : void {
        let initialHeight = this.scrollableContent.offsetHeight;
        this.contentWrapper.addEventListener('sizeChange', (e) => {
            this.initHorizontalScroll();
        });

        setInterval(() => {
            let sizeChangeEvent = new Event('sizeChange');
            let currentHeight = this.scrollableContent.offsetHeight;

            if(initialHeight !== this.scrollableContent.offsetHeight){
                initialHeight = currentHeight;
                this.contentWrapper.dispatchEvent(sizeChangeEvent);
            }
        }, 500);
    }

    private getWheelHandler () : any {
        let self = this;
        return function wheelHandler (e) {
            let delta = self.getWheelDelta(e);
            let distance = self.SCROLL_DISTANCE;
            self.scrollContent(self.scrollableContent, delta, distance, false);
            self.scrollContent(self.scrollBarV, delta, -(distance * (self.contentWrapper.clientHeight/self.scrollableContent.clientHeight)), true);
        };
    }

    private initBarCSS() : void {
        let options = this.barOptions;
        if(typeof options !== 'object') return;

        for(let property in options){
            this.scrollBarV.style[property] = options[property];
            this.scrollBarH.style[property] = options[property];
        }
    }

    init () : void {
        this.SCROLL_DISTANCE = 100;
        this.scrollableContent = this.scrollableContentRef.nativeElement;
        this.contentWrapper = this.contentWrapperRef.nativeElement;
        this.scrollBarV = this.scrollBarVRef.nativeElement;
        this.scrollBarH = this.scrollBarHRef.nativeElement;
        this.initHorizontalScroll();
        this.watchScrollableContent();
        this.setContainerHeight();
    }
}
