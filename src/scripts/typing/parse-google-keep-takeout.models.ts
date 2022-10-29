/**
 * Typing
 * --------------------------------------------------------------------------------
 */
export type KeepNoteLabel = {
    name: string
}
export type KeepNoteAttachment = {
    filePath: string,
    mimetype: string,
}
export type KeepNote = {
    color: string,
    isTrashed: boolean,
    isPinned: boolean,
    isArchived: boolean,
    textContent: string,
    title: string,
    userEditedTimestampUsec: number,
    createdTimestampUsec: number,
    labels?: KeepNoteLabel[],
    attachments?: KeepNoteAttachment[],
};
/**
 * --------------------------------------------------------------------------------
 */
