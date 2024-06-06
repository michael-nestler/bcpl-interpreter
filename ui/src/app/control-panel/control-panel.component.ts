import { JsonPipe } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { Component, OnInit, inject, input, output, signal } from "@angular/core";
import { Program } from "bcpl";
import { firstValueFrom } from "rxjs";

@Component({
    selector: "control-panel",
    standalone: true,
    imports: [JsonPipe],
    template: `
        <button type="button" popovertarget="browser-action">
            <div class="material-symbols-outlined">folder_open</div>
        </button>
        <div popover id="browser-action">
            <div class="browse-bcpl-wrapper">
                <button type="button">
                    <span class="material-symbols-outlined">feature_search</span>
                    Predefined BCPL
                    <span class="material-symbols-outlined">chevron_right</span>
                </button>
                <div class="side-menu">
                    @for (program of predefinedPrograms(); track $index) {
                        <button type="button" (click)="loadPredefinedProgram(program)">{{ program }}</button>
                    }
                </div>
            </div>
            <button type="button" (click)="pasteOCODE()"><span class="material-symbols-outlined">content_paste_go</span> Paste OCODE</button>
        </div>
        <button type="button" [disabled]="state !== 'paused'" (click)="next()">
            <div class="material-symbols-outlined">step</div>
        </button>
        <button type="button" [disabled]="state !== 'paused'" (click)="resumeExecution()">
            <div class="material-symbols-outlined">play_arrow</div>
        </button>
        <button type="button" (click)="reset()">
            <div class="material-symbols-outlined">stop</div>
        </button>
    `,
    styleUrl: "./control-panel.component.css",
})
export class ControlPanelComponent implements OnInit {
    program = input.required<Program>();
    breakpoints = input.required<boolean[]>();
    updateCodeView = output();
    resetProgram = output();
    loadCode = output<string>();
    state: 'paused' | 'finished' | 'running' = 'paused';
    predefinedPrograms = signal<string[]>([]);
    http = inject(HttpClient);

    async ngOnInit() {
        const response = await firstValueFrom(this.http.get<string[]>("/assets/bcpl/index.json"));
        this.predefinedPrograms.set(response);
    }

    next() {
        this.program().next();
        this.updateCodeView.emit();
    }

    async resumeExecution() {
        let count = 0;
        let running;
        this.state = 'running';
        while (running = this.program().next()) {
            if (count++ >= 5_000_000) {
                count = await new Promise((resolve) => {
                    setTimeout(() => resolve(0), 0);
                });
            }
            const line = this.program().commands[this.program().programCounter]?.start?.[0];
            if (this.breakpoints()[line - 1]) {
                break;
            }
        }
        this.state = running ? 'paused' : 'finished';
        this.updateCodeView.emit();
    }

    reset() {
        this.state = 'paused';
        this.resetProgram.emit();
    }

    async pasteOCODE() {
        const text = await navigator.clipboard.readText();
        this.loadCode.emit(text);
        this.state = 'paused';
    }

    async loadPredefinedProgram(name: string) {
        const text = await firstValueFrom(this.http.get(`/assets/bcpl/${name}.ocode`, { responseType: 'text' }));
        this.loadCode.emit(text);
        this.state = 'paused';
    }
}
