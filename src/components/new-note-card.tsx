import React, { useState, useEffect } from 'react';

import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

import { toast } from 'sonner';

interface NewNoteCardProps {
  onNoteCreated: (content: string) => void;
}

let speechRecognition: SpeechRecognition | null = null;

export const NewNoteCard = ({ onNoteCreated }: NewNoteCardProps) => {
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [content, setContent] = useState('');

  const handleStartEditor = () => setShouldShowOnboarding(false);

  const handleStartRecording = () => {
    const isSpeechRecognitionAPIAvailable =
      'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;

    if (!isSpeechRecognitionAPIAvailable) {
      alert('Infelizmente seu navegador não suporta a API de gravação');
      return;
    }

    setShouldShowOnboarding(false);
    setIsRecording(true);

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

    speechRecognition = new SpeechRecognitionAPI();

    speechRecognition.lang = 'pt-BR';
    speechRecognition.continuous = true;
    speechRecognition.maxAlternatives = 1;
    speechRecognition.interimResults = true;

    speechRecognition.onresult = (event) => {
      const transcription = Array.from(event.results).reduce((text, result) => {
        return text.concat(result[0].transcript);
      }, '');

      setContent(transcription);
    };

    speechRecognition.onerror = (event) => {
      console.error(event);
    };

    speechRecognition.start();
  };

  const handleStopRecording = () => {
    if (speechRecognition) {
      speechRecognition.stop();
      setIsRecording(false);
    }
  };

  const handleContentChanged = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setContent(event.target.value);
    event.target.value === '' && setShouldShowOnboarding(true);
  };

  const handleSaveNote = (event: FormEvent) => {
    event.preventDefault();

    onNoteCreated(content);
    setShouldShowOnboarding(true);
    setContent('');
    toast.success('Nota criada com sucesso!');
  };

  return (
    <Dialog.Root>
      {/* elemento que abre a modal */}
      <Dialog.Trigger className='rounded-md text-left flex flex-col bg-slate-800 p-5 gap-3 overflow-hidden relative outline-none hover:ring-2 hover:ring-slate-700  focus-visible:ring-2 focus-visible:ring-lime-400'>
        <span className='text-sm font-medium text-slate-200'>Adicionar nota</span>

        <p className='text-sm leading-6 text-slate-400'>
          Grave uma nota em áudio que será convertida para texto automaticamente.
        </p>
      </Dialog.Trigger>

      {/* conteudo da modal */}
      <Dialog.Portal>
        <Dialog.Overlay className='inset-0 fixed bg-black/50' />
        <Dialog.Content className='fixed overflow-y-auto scrollbar-thumb-gray-700 inset-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-[640px] w-full md:h-[60vh] bg-slate-700 md:rounded-md flex flex-col outline-none'>
          <Dialog.Close className='absolute right-0 top-0 bg-slate-800 p-1.5 text-slate-400 hover:text-slate-100'>
            <X className='size-5' />
          </Dialog.Close>

          <div className='flex flex-1 flex-col gap-3 p-5'>
            <span className='text-sm font-medium text-slate-300'>Adicionar nota</span>

            {shouldShowOnboarding ? (
              <p className='text-sm leading-6 text-slate-400'>
                Comece{' '}
                <button
                  className='fon-midium text-lime-400 hover:underline'
                  onClick={handleStartRecording}
                >
                  gravando uma nota
                </button>{' '}
                em áudio ou se preferir{' '}
                <button
                  className='fon-midium text-lime-400 hover:underline'
                  onClick={handleStartEditor}
                >
                  utilize apenas texto
                </button>
                .
              </p>
            ) : (
              <textarea
                id='contentNote'
                autoFocus
                className='text-sm leading-6 text-slate-400 bg-transparent resize-none flex-1 outline-none'
                onChange={handleContentChanged}
                value={content}
              />
            )}
          </div>

          {isRecording ? (
            <button
              className='w-full flex items-center justify-center gap-2 bg-slate-800 py-4 text-center text-sm text-slate-300 outline-none font-medium group'
              onClick={handleStopRecording}
            >
              <div className='bg-red-500 rounded-full size-2.5 animate-pulse' />
              Gravando! (clique p/ interromper)
            </button>
          ) : (
            <button
              className='w-full bg-lime-400 py-4 text-center text-sm text-lime-950 outline-none font-medium hover:bg-lime-500'
              disabled={!content.length}
              onClick={handleSaveNote}
            >
              Salvar nota
            </button>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
