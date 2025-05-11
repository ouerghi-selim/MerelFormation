import React from 'react';
import { X, Calendar, Users } from 'lucide-react';
import { Link } from "react-router-dom";

interface Session {
    id: number;
    startDate: string;
    endDate: string;
    maxParticipants: number;
    status: string;
}

interface SessionSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    sessions: Session[];
    onSelectSession: (sessionId: number) => void;
}

const SessionSelectionModal: React.FC<SessionSelectionModalProps> = ({
                                                                         isOpen,
                                                                         onClose,
                                                                         title,
                                                                         sessions,
                                                                         onSelectSession
                                                                     }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
             onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto"
                 onClick={(e) => e.stopPropagation()}>
                <div className="sticky top-0 bg-blue-900 text-white p-6 rounded-t-lg">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold">{title}</h3>
                        <button className="text-white hover:text-blue-200 p-1" onClick={onClose}>
                            <X className="h-6 w-6"/>
                        </button>
                    </div>
                    <p className="mt-2 text-blue-100">Choisissez une session ci-dessous</p>
                </div>

                <div className="p-6">
                    {sessions && sessions.length > 0 ? (
                        <div className="space-y-4">
                            {sessions.map(session => (
                                <div key={session.id}
                                     className="border border-gray-200 hover:border-blue-300 p-5 rounded-lg transition-all">
                                    <div className="flex items-center text-gray-700 mb-3">
                                        <Calendar className="h-5 w-5 mr-2 text-blue-900"/>
                                        <span>Du <strong>{new Date(session.startDate).toLocaleDateString()}</strong> au <strong>{new Date(session.endDate).toLocaleDateString()}</strong></span>
                                    </div>
                                    <div className="flex items-center text-gray-700 mb-4">
                                        <Users className="h-5 w-5 mr-2 text-blue-900"/>
                                        <span><strong>{session.maxParticipants}</strong> places maximum</span>
                                    </div>
                                    <button
                                        className="w-full bg-blue-900 text-white px-4 py-3 rounded-lg hover:bg-blue-800 transition flex items-center justify-center"
                                        onClick={() => onSelectSession(session.id)}
                                    >
                                        Réserver cette session
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Calendar className="h-12 w-12 text-blue-900 mx-auto mb-4"/>
                            <p className="text-gray-700 mb-2 font-medium">Aucune session disponible actuellement</p>
                            <p className="text-gray-600 mb-4">Contactez-nous pour connaître les prochaines dates</p>
                            <Link to="/contact"
                                  className="inline-block bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800">
                                Nous contacter
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SessionSelectionModal;