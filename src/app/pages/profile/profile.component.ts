import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
    profileForm: FormGroup;
    loading = false;
    error: string | null = null;

    constructor(private fb: FormBuilder) {
        this.profileForm = this.fb.group({
            email: [{ value: 'demo@etu.com', disabled: true }, [Validators.required, Validators.email]],
            name: ['John Doe', Validators.required],
            avatarUrl: ['']
        });
    }

    ngOnInit() {
        // Charger les infos du profil ici si besoin
    }

    onSave() {
        if (this.profileForm.invalid) return;
        this.loading = true;
        // Appel au service pour sauvegarder le profil (à implémenter)
        setTimeout(() => {
            this.loading = false;
            this.error = null;
            // Afficher une notification de succès si besoin
        }, 1000);
    }
} 