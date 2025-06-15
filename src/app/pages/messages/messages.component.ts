import { Component, OnInit } from '@angular/core';
import { MessagesService, Message } from '../../services/messages.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'app-messages',
    templateUrl: './messages.component.html',
    styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit {
    messages: Message[] = [];
    loading = false;
    messageForm: FormGroup;
    error: string | null = null;
    // À remplacer par l'ID réel de l'utilisateur connecté
    userId = 'user-demo';
    receiverId = 'user-demo-2';

    constructor(private messagesService: MessagesService, private fb: FormBuilder) {
        this.messageForm = this.fb.group({
            content: ['', Validators.required]
        });
    }

    ngOnInit() {
        this.fetchMessages();
    }

    fetchMessages() {
        this.loading = true;
        this.messagesService.getMessages(this.userId).subscribe({
            next: msgs => { this.messages = msgs; this.loading = false; },
            error: err => { this.error = err.message; this.loading = false; }
        });
    }

    onSend() {
        if (this.messageForm.invalid) return;
        this.loading = true;
        this.messagesService.sendMessage(this.userId, this.receiverId, this.messageForm.value.content).subscribe({
            next: msg => {
                this.messages.push(msg);
                this.messageForm.reset();
                this.loading = false;
            },
            error: err => { this.error = err.message; this.loading = false; }
        });
    }
} 