import { Component, OnInit } from '@angular/core';
import { AdsService, Ad } from '../../services/ads.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'app-ads',
    templateUrl: './ads.component.html',
    styleUrls: ['./ads.component.scss']
})
export class AdsComponent implements OnInit {
    ads: Ad[] = [];
    loading = false;
    showForm = false;
    adForm: FormGroup;
    error: string | null = null;

    constructor(private adsService: AdsService, private fb: FormBuilder) {
        this.adForm = this.fb.group({
            title: ['', Validators.required],
            description: ['', Validators.required],
            price: [0, [Validators.required, Validators.min(1)]]
        });
    }

    ngOnInit() {
        this.fetchAds();
    }

    fetchAds() {
        this.loading = true;
        this.adsService.getAds().subscribe({
            next: ads => { this.ads = ads; this.loading = false; },
            error: err => { this.error = err.message; this.loading = false; }
        });
    }

    openForm() {
        this.showForm = true;
        this.adForm.reset({ price: 0 });
        this.error = null;
    }

    closeForm() {
        this.showForm = false;
        this.error = null;
    }

    onSubmit() {
        if (this.adForm.invalid) return;
        this.loading = true;
        // Remplacer 'sellerId' par l'ID réel de l'utilisateur connecté
        this.adsService.createAd(
            this.adForm.value.title,
            this.adForm.value.description,
            this.adForm.value.price,
            'sellerId-demo'
        ).subscribe({
            next: ad => {
                this.ads.unshift(ad);
                this.closeForm();
                this.loading = false;
            },
            error: err => { this.error = err.message; this.loading = false; }
        });
    }
} 